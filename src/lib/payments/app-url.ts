/** Public app URL helpers — shared outside the payment provider. */

/** Accepts `https://site.com` or bare `site.com` (common in Vercel env). */
export function normalizePublicUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "");
  if (!trimmed) return trimmed;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function getAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return normalizePublicUrl(fromEnv);
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export function isLocalUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host.endsWith(".local") ||
      /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)
    );
  } catch {
    return true;
  }
}

/** Host the browser actually used — not NEXT_PUBLIC_APP_URL (often localhost). */
export function originFromRequest(request: Request): string {
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "")
    .split(",")[0]
    .trim();
  if (!host) return getAppUrl();

  const forwarded = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const local =
    host.startsWith("localhost") ||
    host.startsWith("127.") ||
    /^\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?$/.test(host);
  const proto = forwarded || (local ? "http" : "https");
  return `${proto}://${host}`;
}

/** Prefer your deployed site URL when developing local payment callbacks. */
export function paymentReturnBase(request: Request): string {
  const paymentBase = process.env.PAYSTACK_RETURN_BASE_URL?.trim();
  const candidates = [
    paymentBase ? normalizePublicUrl(paymentBase) : null,
    originFromRequest(request),
    getAppUrl(),
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ].filter((v): v is string => Boolean(v));

  for (const url of candidates) {
    if (!isLocalUrl(url)) return url;
  }

  throw new Error(
    "Payments need a public callback URL. Deploy the app and set PAYSTACK_RETURN_BASE_URL to your live domain.",
  );
}

if (process.env.NODE_ENV === "test") {
  console.assert(
    normalizePublicUrl("www.vmcmovies.xyz") === "https://www.vmcmovies.xyz",
    "normalizePublicUrl should prefix https://",
  );
}
