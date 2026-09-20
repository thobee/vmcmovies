import crypto from "crypto";
import type { Collection, Document } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import { findUserByEmail, updateAdminPassword } from "@/lib/auth/users";
import { hashPassword } from "@/lib/auth/password";
import { isEmailConfigured } from "@/lib/email/config";
import { sendEmail } from "@/lib/email/resend";
import { adminResetOtpEmail } from "@/lib/email/templates";

const COLLECTION = "admin_password_resets";
const TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type ResetDoc = Document & {
  email: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
};

let indexesReady = false;

async function col(): Promise<Collection<ResetDoc>> {
  const c = (await getDb()).collection<ResetDoc>(COLLECTION);
  if (!indexesReady) {
    await c.createIndex({ email: 1 }, { unique: true });
    await c.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    indexesReady = true;
  }
  return c;
}

function otpSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET must be set and at least 32 characters");
  return s;
}

function hashOtp(email: string, otp: string): string {
  return crypto.createHmac("sha256", otpSecret()).update(`${email}:${otp}`).digest("hex");
}

function hashesMatch(a: string, b: string): boolean {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

export async function requestAdminPasswordReset(
  email: string
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  if (!isEmailConfigured()) {
    return { ok: false, error: "Email isn’t configured on this server.", status: 503 };
  }

  const normalized = email.toLowerCase().trim();
  const user = await findUserByEmail(normalized);

  if (user?.role === "admin") {
    const otp = String(crypto.randomInt(100000, 1000000));
    const now = new Date();
    await (await col()).updateOne(
      { email: normalized },
      {
        $set: {
          email: normalized,
          otpHash: hashOtp(normalized, otp),
          expiresAt: new Date(now.getTime() + TTL_MS),
          attempts: 0,
          createdAt: now,
        },
      },
      { upsert: true }
    );

    const sent = await sendEmail({
      to: normalized,
      subject: "Your VMC admin reset code",
      html: adminResetOtpEmail(otp),
    });
    if (!sent.ok) {
      return { ok: false, error: "Couldn’t send the reset code. Try again shortly.", status: 502 };
    }
  }

  return { ok: true };
}

export async function completeAdminPasswordReset(input: {
  email: string;
  otp: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const email = input.email.toLowerCase().trim();
  const otp = input.otp.replace(/\s+/g, "");
  const c = await col();
  const doc = await c.findOne({ email });

  if (!doc || doc.expiresAt < new Date()) {
    if (doc) await c.deleteOne({ email });
    return { ok: false, error: "Invalid or expired code", status: 400 };
  }

  if (doc.attempts >= MAX_ATTEMPTS) {
    await c.deleteOne({ email });
    return { ok: false, error: "Too many attempts. Request a new code.", status: 429 };
  }

  if (!hashesMatch(doc.otpHash, hashOtp(email, otp))) {
    await c.updateOne({ email }, { $inc: { attempts: 1 } });
    return { ok: false, error: "Invalid or expired code", status: 400 };
  }

  const user = await findUserByEmail(email);
  if (!user || user.role !== "admin") {
    await c.deleteOne({ email });
    return { ok: false, error: "Invalid or expired code", status: 400 };
  }

  const passwordHash = await hashPassword(input.password);
  const updated = await updateAdminPassword(email, passwordHash);
  await c.deleteOne({ email });
  if (!updated) {
    return { ok: false, error: "Couldn’t update password", status: 500 };
  }

  return { ok: true };
}
