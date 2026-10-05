import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/payments/app-url";

export default function robots(): MetadataRoute.Robots {
  const appUrl = getAppUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/admin/"],
    },
    host: appUrl,
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
