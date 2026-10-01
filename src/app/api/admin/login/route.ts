import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import QRCode from "qrcode";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import {
  countAdmins,
  createUser,
  enableAdminTotp,
  findUserByEmail,
  findUserById,
  getAdminMfa,
  setAdminRecoveryHashes,
} from "@/lib/auth/users";
import { getAdminEmail, getAdminPasswordHash, isAdminConfigured } from "@/lib/admin/config";
import { isAdminRole } from "@/lib/admin/permissions";
import { signAdminSession, withAdminSession } from "@/lib/admin/session";
import { clearMfaPending, readMfaPending, signMfaPending, withMfaPending } from "@/lib/admin/mfa";
import {
  base32Decode,
  decryptTotpSecret,
  encryptTotpSecret,
  generateRecoveryCodes,
  generateTotpSecret,
  hashRecovery,
  isRecoveryCode,
  otpauthUrl,
  recoveryHashMatches,
  verifyTotp,
} from "@/lib/admin/totp";
import { clientIp, rateLimited, RATE_LIMIT_MSG } from "@/lib/security/rate-limit";

const passwordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const codeSchema = z.object({
  code: z.string().trim().min(6).max(19),
});

const INVALID = "Invalid email or password";
const INVALID_CODE = "Invalid authenticator code";

function signInAgainResponse() {
  return clearMfaPending(NextResponse.json({ error: "Sign in again" }, { status: 401 }));
}

async function finishLogin(userId: string, email: string) {
  const user = await findUserById(userId);
  if (!user || !isAdminRole(user.role)) {
    return NextResponse.json({ error: INVALID }, { status: 401 });
  }
  const token = await signAdminSession(userId, email, user.role);
  return clearMfaPending(
    withAdminSession(NextResponse.json({ ok: true, email, role: user.role }), token),
  );
}

async function afterPasswordOk(userId: string, email: string) {
  const mfa = await getAdminMfa(userId);
  if (mfa?.enabled && mfa.secretEnc) {
    const pending = await signMfaPending({ userId, enroll: false });
    return withMfaPending(NextResponse.json({ ok: true, step: "totp" }), pending);
  }

  const { base32 } = generateTotpSecret();
  const secretEnc = encryptTotpSecret(base32);
  const pending = await signMfaPending({ userId, enroll: true, secretEnc });
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl(email, base32), {
    width: 220,
    margin: 1,
    color: { dark: "#111111", light: "#ffffff" },
  });
  return withMfaPending(
    NextResponse.json({ ok: true, step: "enroll", qrDataUrl, secret: base32 }),
    pending,
  );
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);

  try {
    const body = await request.json();

    if (body?.ack === true) {
      if (rateLimited(`admin-mfa:${ip}`, 8)) {
        return NextResponse.json({ error: RATE_LIMIT_MSG }, { status: 429 });
      }
      return ackRecovery(request);
    }

    if (typeof body?.code === "string") {
      if (rateLimited(`admin-mfa:${ip}`, 8)) {
        return NextResponse.json({ error: RATE_LIMIT_MSG }, { status: 429 });
      }
      return verifyCode(request, body);
    }

    if (rateLimited(`admin-pw:${ip}`, 8)) {
      return NextResponse.json({ error: RATE_LIMIT_MSG }, { status: 429 });
    }
    return verifyPasswordStep(body);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed";
    console.error("[admin/login] exception", message);
    if (message.includes("MONGODB_URI") || message.includes("AUTH_SECRET")) {
      return NextResponse.json(
        { error: "Service temporarily unavailable. Try again shortly." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

async function verifyPasswordStep(body: unknown) {
  const parsed = passwordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  const normalized = parsed.data.email.toLowerCase().trim();
  const user = await findUserByEmail(normalized);

  if (user) {
    if (!isAdminRole(user.role)) {
      return NextResponse.json({ error: INVALID }, { status: 401 });
    }
    const passwordOk = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!passwordOk) {
      return NextResponse.json({ error: INVALID }, { status: 401 });
    }
    return afterPasswordOk(user._id, user.email);
  }

  const adminCount = await countAdmins();
  if (isAdminConfigured() && adminCount === 0) {
    const adminEmail = getAdminEmail();
    if (
      normalized === adminEmail &&
      (await verifyPassword(parsed.data.password, getAdminPasswordHash()))
    ) {
      const created = await createUser({
        email: adminEmail,
        passwordHash: await hashPassword(parsed.data.password),
        telegramUsername: "vmcadmin",
        role: "admin",
      });
      return afterPasswordOk(created._id, created.email);
    }
  }

  return NextResponse.json({ error: INVALID }, { status: 401 });
}

async function verifyCode(request: NextRequest, body: unknown) {
  const parsed = codeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: INVALID_CODE }, { status: 400 });
  }

  const pending = await readMfaPending(request);
  if (!pending) {
    return signInAgainResponse();
  }

  const user = await findUserById(pending.userId);
  if (!user || !isAdminRole(user.role)) {
    return NextResponse.json({ error: INVALID_CODE }, { status: 401 });
  }

  if (pending.enroll) {
    if (!pending.secretEnc) {
      return signInAgainResponse();
    }
    let secret: Buffer;
    try {
      secret = base32Decode(decryptTotpSecret(pending.secretEnc));
    } catch {
      return signInAgainResponse();
    }
    if (!verifyTotp(secret, parsed.data.code)) {
      return NextResponse.json({ error: INVALID_CODE }, { status: 401 });
    }
    const codes = generateRecoveryCodes();
    const hashes = codes.map(hashRecovery);
    await enableAdminTotp(user._id, pending.secretEnc, hashes);
    const token = await signAdminSession(user._id, user.email, user.role);
    return clearMfaPending(
      withAdminSession(
        NextResponse.json({
          ok: true,
          step: "recovery",
          email: user.email,
          role: user.role,
          recoveryCodes: codes,
        }),
        token,
      ),
    );
  }

  const mfa = await getAdminMfa(user._id);
  if (!mfa?.enabled || !mfa.secretEnc) {
    return NextResponse.json({ error: "Sign in again" }, { status: 401 });
  }

  if (isRecoveryCode(parsed.data.code)) {
    const incoming = hashRecovery(parsed.data.code);
    const next = mfa.recoveryHashes.filter((h) => !recoveryHashMatches(h, incoming));
    if (next.length === mfa.recoveryHashes.length) {
      return NextResponse.json({ error: INVALID_CODE }, { status: 401 });
    }
    await setAdminRecoveryHashes(user._id, next);
    return finishLogin(user._id, user.email);
  }

  let secret: Buffer;
  try {
    secret = base32Decode(decryptTotpSecret(mfa.secretEnc));
  } catch {
    return NextResponse.json({ error: INVALID_CODE }, { status: 401 });
  }
  if (!verifyTotp(secret, parsed.data.code)) {
    return NextResponse.json({ error: INVALID_CODE }, { status: 401 });
  }
  return finishLogin(user._id, user.email);
}

async function ackRecovery(request: NextRequest) {
  const pending = await readMfaPending(request);
  if (!pending) {
    return signInAgainResponse();
  }
  const user = await findUserById(pending.userId);
  if (!user || !isAdminRole(user.role)) {
    return signInAgainResponse();
  }
  const mfa = await getAdminMfa(user._id);
  if (!mfa?.enabled) {
    return signInAgainResponse();
  }
  return finishLogin(user._id, user.email);
}
