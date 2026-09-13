import type { Quality } from "./quality";

export type { Quality };
export type ContentType = "movie" | "series";

/** Series season — you paste the Telegram bot link; episodes live in the bot. */
export interface Season {
  seasonNumber: number;
  /** Your Telegram deep link for this season (from the bot). */
  downloadUrl: string;
}

export interface Content {
  id: string;
  /** URL slug — unique, human-readable (e.g. the-dark-knight) */
  slug: string;
  type: ContentType;
  title: string;
  description: string;
  posterImageUrl: string;
  backdropImageUrl?: string;
  genres: string[];
  year?: string;
  rating?: string;
  runtime?: string;
  /** Available download resolutions, e.g. 480p / 720p / 1080p / 4K */
  qualities?: Quality[];
  createdAt: string;
  /** Editorial — homepage hero fallback when no custom slides */
  featured?: boolean;
  /** Movie only — Telegram bot deep link */
  downloadUrl?: string;
  /** Series only — season buttons; bot serves episodes per season */
  seasons?: Season[];
}

export interface ContentListOptions {
  genre?: string;
  search?: string;
  limit?: number;
}
