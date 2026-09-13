import type { Metadata } from "next";
import { getMovies } from "@/lib/catalog";
import SitePage from "@/components/layout/SitePage";
import Footer from "@/components/layout/Footer";
import CatalogPageHero from "@/components/media/CatalogPageHero";
import CatalogGridClient from "@/components/media/CatalogGridClient";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Movies — VMC",
  description:
    "Browse the full VMC movie catalog. Free to browse, premium members get direct Telegram downloads.",
};

export default async function MoviesPage() {
  const items = await getMovies();

  return (
    <SitePage>
      <CatalogPageHero
        eyebrow="Browse catalog"
        title="Movies"
        description="Explore the full movie library. Open any title for details — downloads unlock with premium."
        count={items.length}
        activeTab="movies"
      />

      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <CatalogGridClient initialItems={items} type="movie" />
      </div>

      <Footer />
    </SitePage>
  );
}
