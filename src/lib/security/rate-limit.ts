/** ponytail: in-memory only — resets on deploy / per instance. Redis if you scale out. */
const buckets = new Map<string, { n: number; reset: number }>();

export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function rateLimited(
  key: string,
  max: number,
  windowMs = 15 * 60 * 1000,
): boolean {
  const now = Date.now();
  const row = buckets.get(key);
  if (!row || now > row.reset) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return false;
  }
  row.n += 1;
  return row.n > max;
}

export const RATE_LIMIT_MSG = "Too many attempts. Try again in 15 minutes.";
