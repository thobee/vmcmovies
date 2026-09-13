import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMovies, getSeriesList, collectGenres, resolveGenreName } from "@/lib/catalog";
import SitePage from "@/components/layout/SitePage";
import Footer from "@/components/layout/Footer";
import GenrePageHero from "@/components/media/GenrePageHero";
import GenreCatalogClient from "@/components/media/GenreCatalogClient";

export const revalidate = 120;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [movies, series] = await Promise.all([getMovies(), getSeriesList()]);
  const genreName = resolveGenreName(slug, collectGenres([...movies, ...series]));
  if (!genreName) return { title: "Genre not found — VMC" };

  return {
    title: `${genreName} — Movies & Series on VMC`,
    description: `Browse ${genreName.toLowerCase()} movies and series on Vintage Movie Channel.`,
  };
}

export default async function GenrePage({ params }: PageProps) {
  const { slug } = await params;
  const [movies, series] = await Promise.all([getMovies(), getSeriesList()]);
  const allGenres = collectGenres([...movies, ...series]);
  const genreName = resolveGenreName(slug, allGenres);
  if (!genreName) notFound();

  const g = genreName.toLowerCase();
  const filteredMovies = movies.filter((item) =>
    item.genres.some((tag) => tag.toLowerCase() === g),
  );
  const filteredSeries = series.filter((item) =>
    item.genres.some((tag) => tag.toLowerCase() === g),
  );

  return (
    <SitePage>
      <GenrePageHero
        genreName={genreName}
        movieCount={filteredMovies.length}
        seriesCount={filteredSeries.length}
        allGenres={allGenres}
      />

      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <GenreCatalogClient
          movies={filteredMovies}
          series={filteredSeries}
          genreName={genreName}
        />
      </div>

      <Footer />
    </SitePage>
  );
}
