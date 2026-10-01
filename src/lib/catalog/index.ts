import {
  ALL_CONTENT,
  FEATURED,
  MOVIES,
  SERIES,
} from "@/data/catalog/mock";
import {
  dbGetAllContent,
  dbGetFeaturedContent,
  dbGetMovieBySlugOrId,
  dbGetMovies,
  dbGetSeriesBySlugOrId,
  dbGetSeriesList,
  dbSearchContent,
} from "@/lib/catalog/db";
import { contentSlug } from "@/lib/catalog/resolve";
import type { Content, ContentListOptions } from "./types";

function useDatabase(): boolean {
  return Boolean(process.env.MONGODB_URI?.trim());
}

function allowMockCatalog(): boolean {
  return process.env.NODE_ENV !== "production";
}

/**
 * ponytail: Mongo can be unreachable/misconfigured (bad auth, network access, etc).
 * Any failure here should degrade to mock data rather than crash the page —
 * one guard here covers every caller instead of a try/catch per page.
 */
async function safeDb<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!useDatabase()) return fallback;
  try {
    return await fn();
  } catch (err) {
    console.error("[catalog] MongoDB call failed, falling back to mock data:", err);
    return fallback;
  }
}

export async function getFeaturedContent(): Promise<Content | null> {
  const item = await safeDb(dbGetFeaturedContent, null);
  return item ?? (allowMockCatalog() ? FEATURED : null);
}

export async function getMovies(options?: ContentListOptions): Promise<Content[]> {
  const items = await safeDb(() => dbGetMovies(options), []);
  if (items.length > 0 || options?.search || options?.genre) return items;
  return allowMockCatalog() ? filterMock(MOVIES, options) : [];
}

export async function getSeriesList(options?: ContentListOptions): Promise<Content[]> {
  const items = await safeDb(() => dbGetSeriesList(options), []);
  if (items.length > 0 || options?.search || options?.genre) return items;
  return allowMockCatalog() ? filterMock(SERIES, options) : [];
}

export async function getAllContent(options?: ContentListOptions): Promise<Content[]> {
  const items = await safeDb(() => dbGetAllContent(options), []);
  if (items.length > 0 || options?.search || options?.genre) return items;
  return allowMockCatalog() ? filterMock(ALL_CONTENT, options) : [];
}

export async function getMovieBySlugOrId(key: string): Promise<Content | null> {
  const decoded = decodeURIComponent(key);
  const item = await safeDb(() => dbGetMovieBySlugOrId(decoded), null);
  if (item) return item;

  if (useDatabase()) {
    const movies = await safeDb(() => dbGetMovies(), []);
    const fromDb = movies.find(
      (m) => contentSlug(m) === decoded || m.slug === decoded || m.id === decoded
    );
    if (fromDb) return fromDb;
  }

  if (!allowMockCatalog()) return null;
  return MOVIES.find((m) => contentSlug(m) === decoded || m.slug === decoded || m.id === decoded) ?? null;
}

/** @deprecated Use getMovieBySlugOrId */
export async function getMovieById(id: string): Promise<Content | null> {
  return getMovieBySlugOrId(id);
}

export async function getSeriesBySlugOrId(key: string): Promise<Content | null> {
  const decoded = decodeURIComponent(key);
  const item = await safeDb(() => dbGetSeriesBySlugOrId(decoded), null);
  if (item) return item;

  if (useDatabase()) {
    const series = await safeDb(() => dbGetSeriesList(), []);
    const fromDb = series.find(
      (s) => contentSlug(s) === decoded || s.slug === decoded || s.id === decoded
    );
    if (fromDb) return fromDb;
  }

  if (!allowMockCatalog()) return null;
  return SERIES.find((s) => contentSlug(s) === decoded || s.slug === decoded || s.id === decoded) ?? null;
}

/** @deprecated Use getSeriesBySlugOrId */
export async function getSeriesById(id: string): Promise<Content | null> {
  return getSeriesBySlugOrId(id);
}

export async function getRecommended(item: Content, limit = 12): Promise<Content[]> {
  const listSameType = item.type === "series" ? getSeriesList : getMovies;
  const genre = item.genres[0];

  const pool = genre
    ? await listSameType({ genre, limit: limit + 1 })
    : await listSameType({ limit: limit + 1 });

  const filtered = pool.filter((c) => c.id !== item.id);
  if (filtered.length >= limit) return filtered.slice(0, limit);

  const backfill = (await listSameType({ limit: limit + 1 })).filter(
    (c) => c.id !== item.id && !filtered.some((f) => f.id === c.id)
  );
  return [...filtered, ...backfill].slice(0, limit);
}

export async function searchContent(query: string): Promise<Content[]> {
  const items = await safeDb(() => dbSearchContent(query), []);
  if (items.length > 0) return items;
  return allowMockCatalog() ? filterMock(ALL_CONTENT, { search: query }) : [];
}

function filterMock(items: Content[], options?: ContentListOptions): Content[] {
  let result = items;

  if (options?.genre) {
    const g = options.genre.toLowerCase();
    result = result.filter((item) =>
      item.genres.some((genre) => genre.toLowerCase() === g)
    );
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    result = result.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.genres.some((genre) => genre.toLowerCase().includes(q))
    );
  }

  if (options?.limit) {
    result = result.slice(0, options.limit);
  }

  return result;
}

export { contentDetailPath } from "./paths";
export { genrePath, genreToSlug, collectGenres, resolveGenreName, KNOWN_GENRES } from "./genres";
export { contentSlug, canonicalMoviePath, canonicalSeriesPath } from "./resolve";
export { buildTelegramDownloadUrl, buildTelegramSeasonUrl, getTelegramChannelUrl } from "./telegram";
