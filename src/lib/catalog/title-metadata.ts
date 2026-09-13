import type { Metadata } from "next";
import { getAppUrl } from "@/lib/payments/app-url";
import { contentDetailPath } from "@/lib/catalog/paths";
import type { Content } from "@/lib/catalog/types";

export function titlePageMetadata(item: Content): Metadata {
  const site = getAppUrl();
  const path = contentDetailPath(item);
  const url = `${site}${path}`;
  const title = `${item.title}${item.year ? ` (${item.year})` : ""} — VMC`;
  const description =
    item.description.slice(0, 160) ||
    `Browse ${item.title} on VMC. Free to browse — premium unlocks Telegram downloads.`;
  const image = item.backdropImageUrl || item.posterImageUrl;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "VMC — Vintage Movie Channel",
      type: item.type === "series" ? "video.tv_show" : "video.movie",
      images: image
        ? [{ url: image, alt: item.title, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}
