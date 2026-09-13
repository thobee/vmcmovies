import type { Content } from "./types";
import { slugify } from "@/lib/slug";

/** Effective slug for routing — backfills from title/id when legacy docs lack slug. */
export function contentSlug(item: Pick<Content, "slug" | "title" | "id">): string {
  if (item.slug) return item.slug;
  return slugify(item.title) || item.id;
}

export function canonicalMoviePath(item: Pick<Content, "slug" | "title" | "id">): string {
  return `/movie/${contentSlug(item)}`;
}

export function canonicalSeriesPath(item: Pick<Content, "slug" | "title" | "id">): string {
  return `/series/${contentSlug(item)}`;
}

export function canonicalContentPath(item: Pick<Content, "type" | "slug" | "title" | "id">): string {
  return item.type === "movie" ? canonicalMoviePath(item) : canonicalSeriesPath(item);
}

export function adminMovieEditPath(item: Pick<Content, "slug" | "title" | "id">): string {
  return `/admin/movies/${contentSlug(item)}/edit`;
}

export function adminSeriesEditPath(item: Pick<Content, "slug" | "title" | "id">): string {
  return `/admin/series/${contentSlug(item)}/edit`;
}

/** True when the URL param should redirect to the canonical slug path. */
export function needsSlugRedirect(
  param: string,
  item: Pick<Content, "slug" | "title" | "id">
): boolean {
  const canonical = contentSlug(item);
  return param !== canonical;
}
