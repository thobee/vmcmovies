import { OAuth2Client } from "google-auth-library";
import { SignJWT, jwtVerify } from "jose";
import { getPlanDestination } from "@/lib/payments/plan-destination";

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function authSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters");
  }
  return new TextEncoder().encode(`google-oauth:${secret}`);
}

function looksLikeGoogleClientId(value: string | undefined): boolean {
  const id = value?.trim() ?? "";
  if (!id || id.includes("your-client-id")) return false;
  return id.endsWith(".apps.googleusercontent.com");
}

export function isGoogleAuthConfigured(): boolean {
  const secret = process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "";
  if (!secret || secret === "your-client-secret") return false;
  return looksLikeGoogleClientId(process.env.GOOGLE_CLIENT_ID);
}

export function getGoogleClient(): OAuth2Client | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return new OAuth2Client(clientId, clientSecret, `${appUrl()}/api/auth/google/callback`);
}

export async function signGoogleState(mode: "login" | "signup", next?: string): Promise<string> {
  return new SignJWT({ mode, next: getPlanDestination(next) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(authSecret());
}

export async function verifyGoogleState(
  state: string,
): Promise<{ mode: "login" | "signup"; next?: string } | null> {
  try {
    const { payload } = await jwtVerify(state, authSecret());
    return { mode: payload.mode === "signup" ? "signup" : "login", next: getPlanDestination(payload.next) };
  } catch {
    return null;
  }
}

export function googleAuthUrl(state: string): string {
  const client = getGoogleClient();
  if (!client) throw new Error("Google sign-in is not configured");
  return client.generateAuthUrl({
    access_type: "online",
    scope: ["openid", "email", "profile"],
    state,
    prompt: "select_account",
  });
}

export type GoogleProfile = {
  googleId: string;
  email: string;
  name: string;
};

export async function fetchGoogleProfile(code: string): Promise<GoogleProfile> {
  const client = getGoogleClient();
  if (!client) throw new Error("Google sign-in is not configured");

  const { tokens } = await client.getToken(code);
  if (!tokens.id_token) throw new Error("Missing Google ID token");

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) throw new Error("Incomplete Google profile");

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase().trim(),
    name: payload.name?.trim() || payload.email.split("@")[0] || "vmcuser",
  };
}
