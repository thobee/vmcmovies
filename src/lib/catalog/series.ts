import type { Content, Season } from "./types";

/** Legacy Mongo docs may still have `episodes` — derive seasons for display. */
export function normalizeSeries(content: Content): Content {
  if (content.type !== "series") return content;

  const legacy = content as Content & {
    episodes?: { seasonNumber: number; downloadUrl?: string }[];
    seasons?: (Season & { title?: string })[];
  };

  if (legacy.seasons?.length) {
    return {
      ...legacy,
      seasons: sortSeasons(
        legacy.seasons.map((season) => ({
          seasonNumber: season.seasonNumber,
          downloadUrl: season.downloadUrl?.trim() ?? "",
        }))
      ),
    };
  }

  if (legacy.episodes?.length) {
    const seasonNumbers = [
      ...new Set(legacy.episodes.map((ep) => ep.seasonNumber)),
    ].sort((a, b) => a - b);
    const { episodes: _removed, ...rest } = legacy;
    return {
      ...rest,
      seasons: seasonNumbers.map((seasonNumber) => ({
        seasonNumber,
        downloadUrl:
          legacy.episodes!.find((ep) => ep.seasonNumber === seasonNumber)?.downloadUrl?.trim() ??
          "",
      })),
    };
  }

  return { ...legacy, seasons: legacy.seasons ?? [] };
}

export function sortSeasons(seasons: Season[]): Season[] {
  return [...seasons].sort((a, b) => a.seasonNumber - b.seasonNumber);
}

export function seasonLabel(season: Season): string {
  return `Season ${season.seasonNumber}`;
}

/** CSV: `1,2,3` or `1|https://t.me/bot?start=s1,2|https://...` */
export function parseSeasonsCsv(value?: string): Season[] {
  if (!value?.trim()) return [];

  const seasons: Season[] = [];
  for (const part of value.split(/,/)) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const [numStr, url] = trimmed.split("|").map((s) => s.trim());
    const seasonNumber = Number(numStr);
    if (!Number.isInteger(seasonNumber) || seasonNumber < 1) continue;

    seasons.push({
      seasonNumber,
      downloadUrl: url && /^https?:\/\//i.test(url) ? url : "",
    });
  }

  return sortSeasons(seasons);
}
