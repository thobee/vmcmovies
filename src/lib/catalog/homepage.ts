import type { Content } from "./types";

export const HOMEPAGE_RAIL_LIMIT = 12;

export function sortByNewest(items: Content[]): Content[] {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function sortByRating(items: Content[]): Content[] {
  return [...items]
    .filter((item) => item.rating && !Number.isNaN(parseFloat(item.rating)))
    .sort((a, b) => parseFloat(b.rating!) - parseFloat(a.rating!));
}
