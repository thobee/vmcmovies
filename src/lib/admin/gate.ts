import { sessionCookieOptions } from "@/lib/security/cookies";

/** Optional ADMIN_GATE — scanners hitting /admin/login get a 404 without ?g= or the cookie. */

export const ADMIN_GATE_COOKIE = "vmc_admin_gate";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function getAdminGate(): string {
  return process.env.ADMIN_GATE?.trim() ?? "";
}

/** Public admin auth surfaces — keep this list in sync with new login/reset/signup routes. */
export function isAdminAuthPath(pathname: string): boolean {
  return (
    pathname === "/admin/login" ||
    pathname === "/admin/forgot" ||
    pathname === "/admin/signup" ||
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/password-reset" ||
    pathname === "/api/admin/signup"
  );
}

function toB64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return toB64Url(sig);
}

export async function adminGateToken(gate: string, secret: string): Promise<string> {
  return hmac(secret, `admin-gate:${gate}`);
}

export async function adminGateQueryOk(
  g: string | null,
  gate: string,
  secret: string,
): Promise<boolean> {
  if (!g) return false;
  const a = await hmac(secret, `admin-gate-q:${g}`);
  const b = await hmac(secret, `admin-gate-q:${gate}`);
  return a === b;
}

export function gateCookieOptions() {
  return sessionCookieOptions(COOKIE_MAX_AGE);
}
