import { dbGetHomepageSettings } from "@/lib/site/homepage";
import { DEFAULT_HOMEPAGE_SETTINGS } from "@/lib/site/types";
import HomepageEditor from "@/components/admin/HomepageEditor";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { getMovies, getSeriesList } from "@/lib/catalog";
import { toPublicContent } from "@/lib/catalog/public";
import type { Content } from "@/lib/catalog/types";

export default async function AdminHomepagePage() {
  let settings = DEFAULT_HOMEPAGE_SETTINGS;
  let catalog: Content[] = [];
  try {
    const [savedSettings, movies, series] = await Promise.all([
      dbGetHomepageSettings(),
      getMovies(),
      getSeriesList(),
    ]);
    settings = savedSettings;
    catalog = [...movies, ...series].map(toPublicContent);
  } catch {
    /* defaults */
  }

  return (
    <div>
      <AdminPageHeader
        title="Homepage"
        subtitle="Control the hero banner and rename the content rows visitors see on the home page."
      />
      <HomepageEditor initial={settings} catalog={catalog} />
    </div>
  );
}
