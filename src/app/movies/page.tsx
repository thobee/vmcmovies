import type { Metadata } from "next";
import { getMovies } from "@/lib/catalog";
import SitePage from "@/components/layout/SitePage";
import Footer from "@/components/layout/Footer";
import CatalogPageHero from "@/components/media/CatalogPageHero";
import CatalogGridClient from "@/components/media/CatalogGridClient";
import { toPublicContent } from "@/lib/catalog/public";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Movies — VMC",
  description:
    "Browse the full VMC movie catalog. Free to browse, premium members get direct Telegram downloads.",
};

export default async function MoviesPage() {
  const items = await getMovies();

  return (
    <SitePage className="catalog-page" glow={false}>
      <CatalogPageHero
        eyebrow="Browse catalog"
        title="Movies"
        description="Explore the movie library. Every card clearly shows whether its download is Free or Premium."
        count={items.length}
        activeTab="movies"
        backdrop={items.find((item) => item.backdropImageUrl) ?? items[0]}
      />

      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <CatalogGridClient initialItems={items.map(toPublicContent)} type="movie" />
      </div>

      <Footer />
    </SitePage>
  );
}
