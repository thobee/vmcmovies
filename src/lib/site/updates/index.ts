import { dbListPublishedUpdates } from "@/lib/site/updates/db";
import type { SiteUpdate } from "@/lib/site/updates/types";

export async function getPublishedUpdates(limit = 40): Promise<SiteUpdate[]> {
  if (!process.env.MONGODB_URI?.trim()) return [];
  try {
    return await dbListPublishedUpdates(limit);
  } catch (err) {
    console.error("[site] published updates failed:", err);
    return [];
  }
}
