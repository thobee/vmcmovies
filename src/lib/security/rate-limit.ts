import { createHash } from "node:crypto";
import { getDb } from "@/lib/db/mongodb";

type RateLimitBucket = { _id: string; n: number; expiresAt: Date };
let indexReady: Promise<string> | undefined;

// Only used for development without a database. Production counters are shared.
const buckets = new Map<string, { n: number; reset: number }>();

export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function rateLimited(
  key: string,
  max: number,
  windowMs = 15 * 60 * 1000,
): Promise<boolean> {
  const now = Date.now();
  if (process.env.MONGODB_URI?.trim()) {
    const col = (await getDb()).collection<RateLimitBucket>("rate_limits");
    indexReady ??= col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
      .catch((error) => { indexReady = undefined; throw error; });
    await indexReady;
    const window = Math.floor(now / windowMs);
    const _id = createHash("sha256").update(`${key}:${windowMs}:${window}`).digest("hex");
    const update = {
      $inc: { n: 1 },
      $setOnInsert: { expiresAt: new Date((window + 1) * windowMs) },
    };
    // Concurrent first requests can race on the unique _id during upsert.
    const row = await col.findOneAndUpdate({ _id }, update, {
      upsert: true, returnDocument: "after",
    }).catch((error: unknown) => {
      if (error && typeof error === "object" && "code" in error && error.code === 11000) {
        return col.findOneAndUpdate({ _id }, update, { returnDocument: "after" });
      }
      throw error;
    });
    if (!row) throw new Error("Rate limiter unavailable");
    return row.n > max;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("Shared rate limiter requires a database");
  }
  for (const [id, bucket] of buckets) {
    if (now >= bucket.reset) buckets.delete(id);
  }
  const row = buckets.get(key);
  if (!row || now >= row.reset) {
    if (buckets.size >= 10_000) return true;
    buckets.set(key, { n: 1, reset: now + windowMs });
    return false;
  }
  row.n += 1;
  return row.n > max;
}

export const RATE_LIMIT_MSG = "Too many attempts. Try again in 15 minutes.";
