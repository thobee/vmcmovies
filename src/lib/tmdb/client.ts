const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p";

export function getTmdbKey(): string | null {
  return process.env.TMDB_API_KEY?.trim() || null;
}

export function isTmdbConfigured(): boolean {
  return Boolean(getTmdbKey());
}

function imageUrl(path: string | null, size: "w500" | "original"): string | undefined {
  return path ? `${IMG_BASE}/${size}${path}` : undefined;
}

export interface TmdbSearchResult {
  tmdbId: number;
  title: string;
  year?: string;
  posterImageUrl?: string;
}

export interface TmdbDetails {
  id?: string;
  title: string;
  description: string;
  posterImageUrl?: string;
  backdropImageUrl?: string;
  genres: string[];
  year?: string;
  rating?: string;
  runtime?: string;
}

async function tmdbFetch(path: string, params: Record<string, string> = {}) {
  const key = getTmdbKey();
  if (!key) throw new Error("TMDB_API_KEY is not configured");

  const search = new URLSearchParams({ api_key: key, ...params });
  const res = await fetch(`${TMDB_BASE}${path}?${search.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.status_message ?? `TMDB request failed (${res.status})`);
  }

  return res.json();
}

export async function tmdbSearch(
  type: "movie" | "series",
  query: string
): Promise<TmdbSearchResult[]> {
  const endpoint = type === "movie" ? "/search/movie" : "/search/tv";
  const data = await tmdbFetch(endpoint, { query, include_adult: "false" });

  return (data.results ?? []).slice(0, 8).map(
    (r: {
      id: number;
      title?: string;
      name?: string;
      release_date?: string;
      first_air_date?: string;
      poster_path: string | null;
    }): TmdbSearchResult => ({
      tmdbId: r.id,
      title: (type === "movie" ? r.title : r.name) ?? "Untitled",
      year: (type === "movie" ? r.release_date : r.first_air_date)?.slice(0, 4),
      posterImageUrl: imageUrl(r.poster_path, "w500"),
    })
  );
}

export async function tmdbDetails(
  type: "movie" | "series",
  tmdbId: number
): Promise<TmdbDetails> {
  const endpoint = type === "movie" ? `/movie/${tmdbId}` : `/tv/${tmdbId}`;
  const data = await tmdbFetch(endpoint, { append_to_response: "external_ids" });

  const isMovie = type === "movie";
  const title: string = isMovie ? data.title : data.name;
  const releaseDate: string | undefined = isMovie
    ? data.release_date
    : data.first_air_date;
  const endDate: string | undefined = !isMovie ? data.last_air_date : undefined;
  const startYear = releaseDate?.slice(0, 4);
  const endYear = endDate?.slice(0, 4);
  const year =
    !isMovie && data.in_production === false && endYear && endYear !== startYear
      ? `${startYear}\u2013${endYear}`
      : startYear;

  const runtimeMinutes: number | undefined = isMovie
    ? data.runtime
    : data.episode_run_time?.[0];

  const imdbId: string | undefined = data.external_ids?.imdb_id || undefined;

  return {
    id: imdbId || `tmdb-${tmdbId}`,
    title,
    description: data.overview ?? "",
    posterImageUrl: imageUrl(data.poster_path, "w500"),
    backdropImageUrl: imageUrl(data.backdrop_path, "original"),
    genres: (data.genres ?? []).map((g: { name: string }) => g.name),
    year,
    rating: typeof data.vote_average === "number" ? data.vote_average.toFixed(1) : undefined,
    runtime: runtimeMinutes ? `${runtimeMinutes} min` : undefined,
  };
}
