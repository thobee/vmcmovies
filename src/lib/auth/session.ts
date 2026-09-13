import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import {
  effectivePremiumStatus,
  findUserById,
} from "@/lib/auth/users";
import type { SessionUser } from "@/lib/auth/types";
import { sessionCookieOptions } from "@/lib/security/cookies";

const COOKIE_NAME = "vmc_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function getSecret(): Uint8Array | null {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

function requireSecret(): Uint8Array {
  const secret = getSecret();
  if (!secret) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters");
  }
  return secret;
}

export async function createSession(userId: string, remember = false): Promise<void> {
  const maxAge = remember ? 60 * 60 * 24 * 30 : MAX_AGE_SEC;
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(requireSecret());

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, sessionCookieOptions(maxAge));
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<{ user: SessionUser } | null> {
  const secret = getSecret();
  if (!secret) return null;

  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.sub;
    if (!userId) return null;

    const user = await findUserById(userId);
    if (!user) return null;

    const premiumStatus = effectivePremiumStatus(user);

    return {
      user: {
        id: user._id,
        email: user.email,
        telegramUsername: user.telegramUsername,
        role: user.role,
        premiumStatus,
        premiumExpiryDate: user.premiumExpiryDate?.toISOString() ?? null,
      },
    };
  } catch {
    return null;
  }
}

export function toPublicUser(user: SessionUser) {
  return user;
}
