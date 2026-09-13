import type { Content } from "./types";

/** Strip Telegram download links from public JSON / non-premium renders. */
export function toPublicContent(item: Content): Content {
  return {
    ...item,
    downloadUrl: undefined,
    seasons: item.seasons?.map((s) => ({ ...s, downloadUrl: "" })),
  };
}
