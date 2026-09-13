/** URL-safe slugs for content and genres. */

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "login",
  "signup",
  "movie",
  "movies",
  "series",
  "genre",
  "get-access",
  "account",
  "search",
  "tv",
  "terms",
  "privacy",
  "payment",
  "new",
  "edit",
  "import",
  "users",
  "homepage",
  "callback",
  "support",
]);

export function slugify(text: string, maxLen = 80): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLen)
    .replace(/-+$/g, "");
}

export function isValidSlug(slug: string): boolean {
  return slug.length >= 2 && slug.length <= 80 && SLUG_PATTERN.test(slug) && !RESERVED_SLUGS.has(slug);
}

/** ponytail: O(n) scan per candidate; fine for catalog size — upgrade to DB counter if slug churn gets heavy. */
export function dedupeSlug(base: string, taken: Set<string>): string {
  let candidate = base || "untitled";
  if (!taken.has(candidate)) return candidate;
  let n = 2;
  while (taken.has(`${candidate}-${n}`)) n += 1;
  return `${candidate}-${n}`;
}
