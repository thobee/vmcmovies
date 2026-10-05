import type { Content } from "./types";

/** Strip Telegram download links before content crosses into a public client payload. */
export function toPublicContent(item: Content): Content {
  return {
    ...item,
    downloadUrl: undefined,
    seasons: item.seasons?.map((s) => ({ ...s, downloadUrl: "" })),
  };
}
