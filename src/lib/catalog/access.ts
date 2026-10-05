import type { Content, ContentAccessKind } from "./types";

export function contentAccessKind(item: Pick<Content, "accessTier" | "freeUntil">, now = new Date()): ContentAccessKind {
  if (item.accessTier === "free") return "free";

  if (item.freeUntil) {
    const end = new Date(item.freeUntil);
    if (!Number.isNaN(end.getTime()) && end > now) return "temporary_free";
  }

  return "premium";
}

export function contentIsFree(item: Pick<Content, "accessTier" | "freeUntil">, now = new Date()): boolean {
  return contentAccessKind(item, now) !== "premium";
}
