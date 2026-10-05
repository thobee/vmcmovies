import type { Collection, Document } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import { normalizeSeries } from "@/lib/catalog/series";
import { contentSlug } from "@/lib/catalog/resolve";
import { dedupeSlug, slugify } from "@/lib/slug";
import type { Content, ContentListOptions, ContentType } from "@/lib/catalog/types";

const COLLECTION = "content";

type ContentDoc = Document & Content & { featured?: boolean };

let indexesReady = false;

async function contentCollection(): Promise<Collection<ContentDoc>> {
  const db = await getDb();
  const col = db.collection<ContentDoc>(COLLECTION);

  if (!indexesReady) {
    await col.createIndex({ id: 1 }, { unique: true });
    await col.createIndex({ slug: 1 }, { unique: true, sparse: true });
    await col.createIndex({ type: 1, createdAt: -1 });
    await col.createIndex({ title: "text", description: "text", genres: "text" });
    await col.createIndex({ featured: 1 });
    indexesReady = true;
  }

  return col;
}

function toContent(doc: ContentDoc): Content {
  const { _id: _mongoId, featured, ...content } = doc;
  const normalizedType =
    typeof content.type === "string" ? (content.type.toLowerCase() as Content["type"]) : content.type;
  const withType = { ...content, type: normalizedType };
  const base =
    withType.type === "series"
      ? normalizeSeries(withType as Content)
      : (withType as Content);
  const slug = base.slug || slugify(base.title) || base.id;
  return {
    ...base,
    slug,
    featured: featured ?? false,
    accessTier: base.accessTier ?? "premium",
  };
}

function buildFilter(options?: ContentListOptions): Document {
  const filter: Document = {};

  if (options?.genre) {
    filter.genres = { $regex: new RegExp(`^${escapeRegex(options.genre)}$`, "i") };
  }

  if (options?.search) {
    filter.$text = { $search: options.search };
  }

  return filter;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function dbGetMovies(options?: ContentListOptions): Promise<Content[]> {
  const filter = { ...buildFilter(options), type: "movie" as const };
  const col = await contentCollection();
  let cursor = col.find(filter).sort({ createdAt: -1 });

  if (options?.limit) {
    cursor = cursor.limit(options.limit);
  }

  return (await cursor.toArray()).map(toContent);
}

export async function dbGetSeriesList(options?: ContentListOptions): Promise<Content[]> {
  const filter = { ...buildFilter(options), type: "series" as const };
  const col = await contentCollection();
  let cursor = col.find(filter).sort({ createdAt: -1 });

  if (options?.limit) {
    cursor = cursor.limit(options.limit);
  }

  return (await cursor.toArray()).map(toContent);
}

export async function dbGetAllContent(options?: ContentListOptions): Promise<Content[]> {
  const filter = buildFilter(options);
  const col = await contentCollection();
  let cursor = col.find(filter).sort({ createdAt: -1 });

  if (options?.limit) {
    cursor = cursor.limit(options.limit);
  }

  return (await cursor.toArray()).map(toContent);
}

export async function dbGetMovieById(id: string): Promise<Content | null> {
  const doc = await (await contentCollection()).findOne({ id, type: "movie" });
  return doc ? toContent(doc) : null;
}

export async function dbGetSeriesById(id: string): Promise<Content | null> {
  const doc = await (await contentCollection()).findOne({ id, type: "series" });
  return doc ? toContent(doc) : null;
}

export async function dbGetContentById(id: string): Promise<Content | null> {
  const doc = await (await contentCollection()).findOne({ id });
  return doc ? toContent(doc) : null;
}

export async function dbGetContentBySlug(slug: string): Promise<Content | null> {
  const doc = await (await contentCollection()).findOne({ slug });
  return doc ? toContent(doc) : null;
}

export async function dbGetContentBySlugOrId(
  key: string,
  type?: ContentType
): Promise<Content | null> {
  const col = await contentCollection();
  const normalizedKey = key.trim();
  const filter: Document = { $or: [{ slug: normalizedKey }, { id: normalizedKey }] };
  if (type) filter.type = type;

  let doc = await col.findOne(filter);
  if (!doc && type) {
    doc = await col.findOne({ $or: [{ slug: normalizedKey }, { id: normalizedKey }] });
  }
  if (doc) return toContent(doc);

  const docs = await col.find({}).toArray();
  for (const candidate of docs) {
    const content = toContent(candidate);
    if (type && content.type !== type) continue;
    if (
      contentSlug(content) === normalizedKey ||
      content.id === normalizedKey ||
      content.slug === normalizedKey
    ) {
      if (!candidate.slug) {
        const slug = contentSlug(content);
        await col.updateOne({ _id: candidate._id }, { $set: { slug } }).catch(() => {});
      }
      return content;
    }
  }

  return null;
}

export async function dbGetMovieBySlugOrId(key: string): Promise<Content | null> {
  return dbGetContentBySlugOrId(key, "movie");
}

export async function dbGetSeriesBySlugOrId(key: string): Promise<Content | null> {
  return dbGetContentBySlugOrId(key, "series");
}

export async function dbIsSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const filter: Document = { slug };
  if (excludeId) filter.id = { $ne: excludeId };
  const count = await (await contentCollection()).countDocuments(filter);
  return count > 0;
}

export async function dbEnsureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  const col = await contentCollection();
  const taken = new Set<string>();
  const filter: Document = {};
  if (excludeId) filter.id = { $ne: excludeId };
  const existing = await col.find(filter, { projection: { slug: 1 } }).toArray();
  for (const doc of existing) {
    if (doc.slug) taken.add(doc.slug);
  }
  return dedupeSlug(slugify(base) || "untitled", taken);
}

export async function dbGetFeaturedContent(): Promise<Content | null> {
  const col = await contentCollection();
  const featured = await col.findOne({ featured: true });
  if (featured) return toContent(featured);

  const fallback = await col.findOne({}, { sort: { createdAt: -1 } });
  return fallback ? toContent(fallback) : null;
}

export async function dbSearchContent(query: string): Promise<Content[]> {
  const col = await contentCollection();
  const q = query.trim();
  if (!q) return [];

  const textResults = await col
    .find({ $text: { $search: q } })
    .limit(50)
    .toArray();

  if (textResults.length > 0) {
    return textResults.map(toContent);
  }

  const regex = new RegExp(escapeRegex(q), "i");
  const fallback = await col
    .find({
      $or: [{ title: regex }, { description: regex }, { genres: regex }],
    })
    .limit(50)
    .toArray();

  return fallback.map(toContent);
}

export async function dbUpsertContent(items: Content[], featuredId?: string): Promise<number> {
  const col = await contentCollection();
  let count = 0;

  for (const item of items) {
    const { id, ...rest } = item;
    const slug = item.slug || (await dbEnsureUniqueSlug(item.title, id));
    const update: Document = {
      $set: {
        ...rest,
        id,
        slug,
        featured: featuredId ? id === featuredId : false,
      },
    };
    if (item.type === "series") {
      update.$unset = { episodes: "" };
    }
    await col.updateOne({ id }, update, { upsert: true });
    count += 1;
  }

  if (featuredId) {
    await col.updateMany({ id: { $ne: featuredId } }, { $set: { featured: false } });
    await col.updateOne({ id: featuredId }, { $set: { featured: true } });
  }

  return count;
}

export async function dbContentCount(): Promise<number> {
  return (await contentCollection()).countDocuments();
}

export async function dbCreateContent(
  content: Content,
  options?: { featured?: boolean }
): Promise<Content> {
  const col = await contentCollection();
  const existing = await col.findOne({ id: content.id });
  if (existing) {
    throw new Error("Content with this ID already exists");
  }

  const slug = content.slug || (await dbEnsureUniqueSlug(content.title, content.id));
  if (await dbIsSlugTaken(slug, content.id)) {
    throw new Error("Content with this slug already exists");
  }

  const doc: ContentDoc = {
    ...content,
    slug,
    featured: options?.featured ?? false,
  };

  await col.insertOne(doc);

  if (options?.featured) {
    await dbSetFeatured(content.id);
  }

  return { ...content, slug };
}

export async function dbUpdateContent(
  id: string,
  patch: Partial<Content> & { featured?: boolean }
): Promise<Content | null> {
  const col = await contentCollection();
  const { featured, ...contentPatch } = patch;

  if (contentPatch.slug && (await dbIsSlugTaken(contentPatch.slug, id))) {
    throw new Error("Content with this slug already exists");
  }

  const update: Document = {
    $set: {
      ...contentPatch,
      updatedAt: new Date().toISOString(),
    },
  };

  if (featured !== undefined) {
    update.$set.featured = featured;
  }

  if ("seasons" in contentPatch) {
    update.$unset = { episodes: "" };
  }

  if ("freeUntil" in contentPatch && !contentPatch.freeUntil) {
    delete update.$set.freeUntil;
    update.$unset = { ...update.$unset, freeUntil: "" };
  }

  const result = await col.findOneAndUpdate({ id }, update, {
    returnDocument: "after",
  });

  if (!result) return null;

  if (featured) {
    await dbSetFeatured(id);
  }

  return toContent(result);
}

export async function dbDeleteContent(id: string): Promise<boolean> {
  const result = await (await contentCollection()).deleteOne({ id });
  return result.deletedCount === 1;
}

export async function dbMigrateSlugs(): Promise<number> {
  const col = await contentCollection();
  const docs = await col.find({}).toArray();
  const taken = new Set<string>();
  let updated = 0;

  for (const doc of docs) {
    if (doc.slug) taken.add(doc.slug);
  }

  for (const doc of docs) {
    if (doc.slug) continue;
    const base = slugify(doc.title) || doc.id;
    const slug = dedupeSlug(base, taken);
    taken.add(slug);
    await col.updateOne({ _id: doc._id }, { $set: { slug } });
    updated += 1;
  }

  return updated;
}

export async function dbSetFeatured(id: string): Promise<void> {
  const col = await contentCollection();
  await col.updateMany({}, { $set: { featured: false } });
  await col.updateOne({ id }, { $set: { featured: true } });
}

