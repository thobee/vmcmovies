import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getMovieBySlugOrId, getRecommended } from "@/lib/catalog";
import { canonicalMoviePath } from "@/lib/catalog/resolve";
import { titlePageMetadata } from "@/lib/catalog/title-metadata";
import { getSession } from "@/lib/auth/session";
import TitleView from "@/components/media/TitleView";

export const revalidate = 120;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const movie = await getMovieBySlugOrId(slug);
  if (!movie) return { title: "Movie not found — VMC" };
  return titlePageMetadata(movie);
}

export default async function MovieDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const movie = await getMovieBySlugOrId(slug);
  if (!movie) notFound();

  const canonical = canonicalMoviePath(movie);
  if (canonical !== `/movie/${slug}`) {
    redirect(canonical);
  }

  const session = await getSession();
  const recommended = await getRecommended(movie);

  return (
    <TitleView
      item={movie}
      recommended={recommended}
      premiumStatus={session?.user.premiumStatus ?? "none"}
      loggedIn={!!session}
    />
  );
}
