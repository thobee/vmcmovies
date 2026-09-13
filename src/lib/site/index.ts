import { dbGetHomepageSettings } from "@/lib/site/homepage";
import { DEFAULT_HOMEPAGE_SETTINGS } from "@/lib/site/types";

export async function getHomepageSettings() {
  try {
    return await dbGetHomepageSettings();
  } catch (err) {
    console.error("[site] homepage settings failed:", err);
    return DEFAULT_HOMEPAGE_SETTINGS;
  }
}
