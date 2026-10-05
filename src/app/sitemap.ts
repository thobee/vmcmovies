import type { MetadataRoute } from "next";
import { getMovies, getSeriesList } from "@/lib/catalog";
import { contentDetailPath } from "@/lib/catalog/paths";
import { getAppUrl } from "@/lib/payments/app-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = getAppUrl();
  const [movies, series] = await Promise.all([getMovies(), getSeriesList()]);
  const now = new Date();

  const staticRoutes = [
    { path: "", priority: 1, changeFrequency: "daily" as const },
    { path: "/movies", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/series", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/get-access", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/guide", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/support", priority: 0.5, changeFrequency: "monthly" as const },
  ].map((route) => ({
    url: `${appUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const catalogRoutes = [...movies, ...series].map((item) => ({
    url: `${appUrl}${contentDetailPath(item)}`,
    lastModified: new Date(item.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
    images: [new URL(item.backdropImageUrl || item.posterImageUrl, appUrl).toString()],
  }));

  return [...staticRoutes, ...catalogRoutes];
}
