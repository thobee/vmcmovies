import type { Content } from "./types";
import { contentSlug } from "./resolve";

export function contentDetailPath(item: Pick<Content, "type" | "slug" | "title" | "id">): string {
  const slug = contentSlug(item);
  return item.type === "movie" ? `/movie/${slug}` : `/series/${slug}`;
}
