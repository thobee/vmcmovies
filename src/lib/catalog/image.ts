/** Inline SVG placeholder — avoids broken Next/Image when catalog URLs are empty. */
export const POSTER_PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750"><rect fill="#1c2128" width="500" height="750"/><rect x="175" y="300" width="150" height="150" rx="12" fill="#272e38"/><text x="250" y="490" text-anchor="middle" fill="#6b7a89" font-family="system-ui,sans-serif" font-size="18">VMC</text></svg>',
  );

export function resolveCatalogImage(url?: string | null, fallback?: string | null): string {
  const primary = url?.trim();
  if (primary) return primary;
  const alt = fallback?.trim();
  if (alt) return alt;
  return POSTER_PLACEHOLDER;
}

/** Hero/backdrop — slide override, then wide backdrop, then poster. */
export function resolveHeroImage(
  backdrop?: string | null,
  poster?: string | null,
  override?: string | null,
): string {
  const custom = override?.trim();
  if (custom) return custom;
  return resolveCatalogImage(backdrop, poster);
}

/** Posters — portrait first, backdrop as fallback. */
export function resolvePosterImage(poster?: string | null, backdrop?: string | null): string {
  return resolveCatalogImage(poster, backdrop);
}

export function isDataImage(src: string): boolean {
  return src.startsWith("data:");
}
