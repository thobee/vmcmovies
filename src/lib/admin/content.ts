import type { Content } from "@/lib/catalog/types";
import { sortSeasons } from "@/lib/catalog/series";
import { buildTelegramDownloadUrl } from "@/lib/catalog/telegram";
import { parseQualities } from "@/lib/catalog/quality";
import type { ContentInput } from "@/lib/admin/validation";

export function inputToContent(input: ContentInput): Content {
  const now = new Date().toISOString();
  const base = {
    id: input.id.trim(),
    slug: input.slug.trim(),
    title: input.title.trim(),
    description: input.description.trim(),
    posterImageUrl: input.posterImageUrl.trim(),
    backdropImageUrl: input.backdropImageUrl?.trim() || undefined,
    genres: input.genres.map((g) => g.trim()).filter(Boolean),
    year: input.year?.trim() || undefined,
    rating: input.rating?.trim() || undefined,
    runtime: input.runtime?.trim() || undefined,
    qualities: parseQualities(input.qualities),
    accessTier: input.accessTier ?? "premium",
    freeUntil: input.accessTier === "premium" ? input.freeUntil?.trim() || undefined : undefined,
    createdAt: now,
  };

  if (input.type === "movie") {
    return {
      ...base,
      type: "movie",
      downloadUrl:
        input.downloadUrl?.trim() || buildTelegramDownloadUrl(input.id.trim()),
    };
  }

  return {
    ...base,
    type: "series",
    seasons: sortSeasons(
      input.seasons.map((season) => ({
        seasonNumber: season.seasonNumber,
        downloadUrl: season.downloadUrl.trim(),
      }))
    ),
  };
}

export function parseGenresInput(value: string): string[] {
  return value
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);
}

export function genresToInput(genres: string[]): string {
  return genres.join(", ");
}
