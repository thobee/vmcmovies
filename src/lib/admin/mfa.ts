import { SignJWT, jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sessionCookieOptions } from "@/lib/security/cookies";

const COOKIE = "vmc_admin_mfa";
const MAX_AGE_SEC = 5 * 60;

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters");
  }
  return new TextEncoder().encode(`admin-mfa:${s}`);
}

function cookieOptions() {
  return sessionCookieOptions(MAX_AGE_SEC);
}

export type MfaPending = {
  userId: string;
  enroll: boolean;
  secretEnc?: string;
};

export async function signMfaPending(p: MfaPending): Promise<string> {
  return new SignJWT({
    purpose: "admin-mfa",
    enroll: p.enroll,
    sec: p.secretEnc,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(p.userId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SEC}s`)
    .sign(secret());
}

export function withMfaPending(res: NextResponse, token: string): NextResponse {
  res.cookies.set(COOKIE, token, cookieOptions());
  return res;
}

export function clearMfaPending(res: NextResponse): NextResponse {
  res.cookies.set(COOKIE, "", { ...cookieOptions(), maxAge: 0 });
  return res;
}

export async function readMfaPending(request: NextRequest): Promise<MfaPending | null> {
  const token = request.cookies.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.purpose !== "admin-mfa") return null;
    const userId = typeof payload.sub === "string" ? payload.sub : "";
    if (!userId) return null;
    return {
      userId,
      enroll: payload.enroll === true,
      secretEnc: typeof payload.sec === "string" ? payload.sec : undefined,
    };
  } catch {
    return null;
  }
}
