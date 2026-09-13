import { contentDetailPath } from "@/lib/catalog/paths";
import type { Content } from "@/lib/catalog/types";
import { dbCreateUpdate } from "@/lib/site/updates/db";

/** Post a navbar-bell alert when a new movie/series is added. Soft-fails so create still succeeds. */
export async function notifyNewContent(item: Content): Promise<void> {
  try {
    const isSeries = item.type === "series";
    await dbCreateUpdate({
      kind: isSeries ? "series" : "movie",
      title: `${item.title} is now available`,
      body: isSeries
        ? "New series added to the catalog — open it for seasons and downloads."
        : "New movie added to the catalog — open it for details and downloads.",
      href: contentDetailPath(item),
      published: true,
    });
  } catch (err) {
    console.error("[admin] notifyNewContent failed:", err);
  }
}
