import type { Metadata } from "next";
import { getSeriesList } from "@/lib/catalog";
import SitePage from "@/components/layout/SitePage";
import Footer from "@/components/layout/Footer";
import CatalogPageHero from "@/components/media/CatalogPageHero";
import CatalogGridClient from "@/components/media/CatalogGridClient";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "TV Shows — VMC",
  description:
    "Browse the full VMC series catalog. Free to browse, premium members get direct Telegram downloads.",
};

export default async function SeriesPage() {
  const items = await getSeriesList();

  return (
    <SitePage>
      <CatalogPageHero
        eyebrow="Browse catalog"
        title="TV Shows"
        description="Browse every series in the catalog. Season downloads are sent through Telegram when you're premium."
        count={items.length}
        activeTab="series"
      />

      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <CatalogGridClient initialItems={items} type="series" />
      </div>

      <Footer />
    </SitePage>
  );
}
