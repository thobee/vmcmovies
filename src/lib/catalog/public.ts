import type { Content } from "./types";

/** Strip Telegram download links before content crosses into a public client payload. */
export function toPublicContent(item: Content): Content {
  return {
    ...item,
    downloadUrl: undefined,
    additionalFiles: item.additionalFiles?.map(f => ({ ...f, downloadUrl: "" })),
    seasons: item.seasons?.map((s) => ({
      ...s, downloadUrl: "", zipUrl: undefined,
      episodes: s.episodes?.map(e => ({ ...e, downloadUrl: "" })),
    })),
  };
}
