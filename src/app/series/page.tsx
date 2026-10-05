import type { Metadata } from "next";
import { getSeriesList } from "@/lib/catalog";
import SitePage from "@/components/layout/SitePage";
import Footer from "@/components/layout/Footer";
import CatalogPageHero from "@/components/media/CatalogPageHero";
import CatalogGridClient from "@/components/media/CatalogGridClient";
import { toPublicContent } from "@/lib/catalog/public";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "TV Shows — VMC",
  description:
    "Browse the VMC series catalog with clearly marked free and Premium Telegram downloads.",
};

export default async function SeriesPage() {
  const items = await getSeriesList();

  return (
    <SitePage className="catalog-page" glow={false}>
      <CatalogPageHero
        eyebrow="Browse catalog"
        title="TV Shows"
        description="Browse every series in the catalog. Each card clearly shows whether its Telegram download is Free or Premium."
        count={items.length}
        activeTab="series"
        backdrop={items.find((item) => item.backdropImageUrl) ?? items[0]}
      />

      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <CatalogGridClient initialItems={items.map(toPublicContent)} type="series" />
      </div>

      <Footer />
    </SitePage>
  );
}
