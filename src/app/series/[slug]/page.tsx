import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSeriesBySlugOrId, getRecommended } from "@/lib/catalog";
import { canonicalSeriesPath } from "@/lib/catalog/resolve";
import { titlePageMetadata } from "@/lib/catalog/title-metadata";
import { getSession } from "@/lib/auth/session";
import TitleView from "@/components/media/TitleView";

export const revalidate = 120;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const show = await getSeriesBySlugOrId(slug);
  if (!show) return { title: "Series not found — VMC" };
  return titlePageMetadata(show);
}

export default async function SeriesDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const show = await getSeriesBySlugOrId(slug);
  if (!show) notFound();

  const canonical = canonicalSeriesPath(show);
  if (canonical !== `/series/${slug}`) {
    redirect(canonical);
  }

  const session = await getSession();
  const recommended = await getRecommended(show);

  return (
    <TitleView
      item={show}
      recommended={recommended}
      premiumStatus={session?.user.premiumStatus ?? "none"}
      loggedIn={!!session}
    />
  );
}
