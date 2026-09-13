import type { Collection, Document } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import type { SiteUpdate } from "@/lib/site/updates/types";

const COLLECTION = "site_updates";
/** Updates stay in the bell feed for this many days after publish */
export const UPDATE_VISIBLE_DAYS = 7;

type UpdateDoc = Document & SiteUpdate;

async function updatesCollection(): Promise<Collection<UpdateDoc>> {
  const db = await getDb();
  const col = db.collection<UpdateDoc>(COLLECTION);
  await col.createIndex({ published: 1, publishedAt: -1 });
  return col;
}

function toUpdate(doc: UpdateDoc): SiteUpdate {
  const { _id: _ignore, ...rest } = doc;
  return rest;
}

export async function dbListPublishedUpdates(limit = 40): Promise<SiteUpdate[]> {
  const since = new Date();
  since.setDate(since.getDate() - UPDATE_VISIBLE_DAYS);

  const docs = await (await updatesCollection())
    .find({
      published: true,
      publishedAt: { $gte: since.toISOString() },
    })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(toUpdate);
}

export async function dbListAllUpdates(): Promise<SiteUpdate[]> {
  const docs = await (await updatesCollection()).find({}).sort({ publishedAt: -1 }).toArray();
  return docs.map(toUpdate);
}

export async function dbCreateUpdate(
  input: Omit<SiteUpdate, "id" | "createdAt" | "publishedAt"> & { publishedAt?: string },
): Promise<SiteUpdate> {
  const now = new Date().toISOString();
  const doc: UpdateDoc = {
    id: `upd_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
    kind: input.kind,
    title: input.title,
    body: input.body,
    href: input.href?.trim() || undefined,
    published: input.published,
    createdAt: now,
    publishedAt: input.published ? (input.publishedAt ?? now) : now,
  };

  await (await updatesCollection()).insertOne(doc);
  return toUpdate(doc);
}

export async function dbUpdateSiteUpdate(
  id: string,
  patch: Partial<Pick<SiteUpdate, "kind" | "title" | "body" | "href" | "published" | "publishedAt">>,
): Promise<SiteUpdate | null> {
  const col = await updatesCollection();
  const existing = await col.findOne({ id });
  if (!existing) return null;

  const published = patch.published ?? existing.published;
  const publishedAt =
    patch.publishedAt ??
    (published && !existing.published ? new Date().toISOString() : existing.publishedAt);

  const result = await col.findOneAndUpdate(
    { id },
    {
      $set: {
        ...patch,
        href: patch.href !== undefined ? patch.href.trim() || undefined : existing.href,
        published,
        publishedAt,
      },
    },
    { returnDocument: "after" },
  );

  return result ? toUpdate(result) : null;
}

export async function dbDeleteSiteUpdate(id: string): Promise<boolean> {
  const result = await (await updatesCollection()).deleteOne({ id });
  return result.deletedCount === 1;
}
