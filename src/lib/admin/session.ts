import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { findUserById } from "@/lib/auth/users";
import type { AdminRole } from "@/lib/auth/types";
import { isAdminRole } from "@/lib/admin/permissions";
import { sessionCookieOptions } from "@/lib/security/cookies";

const COOKIE_NAME = "vmc_admin_session";
const MAX_AGE_SEC = 60 * 60 * 12; // 12 hours

function getSecret(): Uint8Array | null {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(`admin:${secret}`);
}

function requireSecret(): Uint8Array {
  const secret = getSecret();
  if (!secret) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters");
  }
  return secret;
}

function cookieOptions() {
  return sessionCookieOptions(MAX_AGE_SEC);
}

export async function signAdminSession(userId: string, email: string, role: AdminRole): Promise<string> {
  return new SignJWT({ email, role, sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SEC}s`)
    .sign(requireSecret());
}

/** Put the session on this response so the browser stores Set-Cookie. */
export function withAdminSession(res: NextResponse, token: string): NextResponse {
  res.cookies.set(COOKIE_NAME, token, cookieOptions());
  return res;
}

export function clearAdminSession(res: NextResponse): NextResponse {
  res.cookies.set(COOKIE_NAME, "", { ...cookieOptions(), maxAge: 0 });
  return res;
}

export async function getAdminSession(): Promise<{ email: string; userId: string; role: AdminRole } | null> {
  const secret = getSecret();
  if (!secret) return null;

  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    if (!isAdminRole(typeof payload.role === "string" ? payload.role : null)) return null;
    const userId = typeof payload.sub === "string" ? payload.sub : "";
    if (!userId) return null;

    const user = await findUserById(userId);
    if (!user || !isAdminRole(user.role) || user.role !== payload.role || !user.totpEnabled) return null;

    return { email: user.email, userId: user._id, role: user.role };
  } catch {
    return null;
  }
}
