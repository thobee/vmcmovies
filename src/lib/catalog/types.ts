import type { Quality } from "./quality";

export type { Quality };
export type ContentType = "movie" | "series";
export type ContentAccessTier = "free" | "premium";
export type ContentAccessKind = "free" | "temporary_free" | "premium";

export interface DownloadFile {
  label: string;
  downloadUrl: string;
  quality?: string;
  fileSize?: string;
}

export interface Episode {
  isFinal?: boolean;
  episodeNumber: number;
  title?: string;
  downloadUrl: string;
}

export interface Season {
  status?: "ongoing" | "completed";
  seasonNumber: number;
  /** Your Telegram deep link for this season (from the bot). */
  downloadUrl: string;
  zipUrl?: string;
  episodes?: Episode[];
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
  /** Permanent access rule. Existing records default to premium. */
  accessTier?: ContentAccessTier;
  /** Premium content is temporarily free until this ISO timestamp. */
  freeUntil?: string;
  /** Movie only — Telegram bot deep link */
  downloadUrl?: string;
  /** Series only: season links, ZIP archives, and individual episode links. */
  seasons?: Season[];
  additionalFiles?: DownloadFile[];
  seriesStatus?: "ongoing" | "completed";
}

export interface ContentListOptions {
  genre?: string;
  search?: string;
  limit?: number;
}
