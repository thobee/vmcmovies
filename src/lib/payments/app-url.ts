/** Public app URL helpers — shared outside the payment provider. */

export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
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

/**
 * Bachs rejects localhost for success_url / cancel_url.
 * Prefer your deployed site URL when developing locally.
 */
export function bachsReturnBase(request: Request): string {
  const candidates = [
    process.env.BACHS_RETURN_BASE_URL?.trim().replace(/\/$/, ""),
    originFromRequest(request),
    getAppUrl(),
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ].filter((v): v is string => Boolean(v));

  for (const url of candidates) {
    if (!isLocalUrl(url)) return url;
  }

  throw new Error(
    "Bachs needs a public success URL (localhost is blocked). " +
      "Deploy the app and set BACHS_RETURN_BASE_URL to your live domain.",
  );
}
