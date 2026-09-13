import type { Content } from "./types";
import { slugify } from "@/lib/slug";

export const KNOWN_GENRES: string[] = [
  "Action",
  "Drama",
  "Comedy",
  "Thriller",
  "Sci-Fi",
  "Crime",
  "Fantasy",
  "Horror",
  "Romance",
  "Animation",
  "Documentary",
  "Adventure",
  "Biography",
  "History",
];

export function genreToSlug(genre: string): string {
  return slugify(genre);
}

export function genrePath(genre: string): string {
  return `/genre/${genreToSlug(genre)}`;
}

export function collectGenres(items: Content[]): string[] {
  const seen = new Map<string, string>();
  for (const item of items) {
    for (const genre of item.genres) {
      const key = genre.toLowerCase();
      if (!seen.has(key)) seen.set(key, genre);
    }
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

/** Resolve a URL slug to the catalog's display genre name (case-insensitive). */
export function resolveGenreName(slug: string, genres: string[]): string | null {
  const normalized = slugify(slug);
  if (!normalized) return null;
  return genres.find((g) => genreToSlug(g) === normalized) ?? null;
}
