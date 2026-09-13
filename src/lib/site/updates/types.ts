export type SiteUpdateKind = "news" | "movie" | "series" | "general";

export interface SiteUpdate {
  id: string;
  kind: SiteUpdateKind;
  title: string;
  body: string;
  /** Optional link — movie page, series page, Telegram, etc. */
  href?: string;
  published: boolean;
  createdAt: string;
  publishedAt: string;
}

export const UPDATE_KIND_LABELS: Record<SiteUpdateKind, string> = {
  news: "News",
  movie: "New movie",
  series: "New series",
  general: "Site update",
};
