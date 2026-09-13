import { ALL_CONTENT, FEATURED } from "@/data/catalog/mock";
import { dbContentCount, dbUpsertContent } from "@/lib/catalog/db";

export async function seedCatalogIfEmpty(): Promise<{ seeded: boolean; count: number }> {
  const existing = await dbContentCount();
  if (existing > 0) {
    return { seeded: false, count: existing };
  }

  const count = await dbUpsertContent(ALL_CONTENT, FEATURED.id);
  return { seeded: true, count };
}

export async function reseedCatalog(): Promise<number> {
  return dbUpsertContent(ALL_CONTENT, FEATURED.id);
}
