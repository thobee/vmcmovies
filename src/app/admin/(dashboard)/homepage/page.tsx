import { dbGetHomepageSettings } from "@/lib/site/homepage";
import { DEFAULT_HOMEPAGE_SETTINGS } from "@/lib/site/types";
import HomepageEditor from "@/components/admin/HomepageEditor";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminHomepagePage() {
  let settings = DEFAULT_HOMEPAGE_SETTINGS;
  try {
    settings = await dbGetHomepageSettings();
  } catch {
    /* defaults */
  }

  return (
    <div>
      <AdminPageHeader
        title="Homepage"
        subtitle="Control the hero banner and rename the content rows visitors see on the home page."
      />
      <HomepageEditor initial={settings} />
    </div>
  );
}
