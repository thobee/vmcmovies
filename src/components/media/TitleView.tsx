import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Film, Star, Tv } from "lucide-react";
import type { Content } from "@/lib/catalog/types";
import type { PremiumStatus } from "@/lib/auth/types";
import { genrePath } from "@/lib/catalog/genres";
import SitePage from "@/components/layout/SitePage";
import Footer from "@/components/layout/Footer";
import DownloadPanel from "@/components/access/DownloadPanel";
import RecommendedGrid from "@/components/media/RecommendedGrid";
import QualityBadges from "@/components/media/QualityBadges";
import PlotText from "@/components/media/PlotText";
import ShareBar from "@/components/media/ShareBar";

export default function TitleView({
  item,
  recommended,
  premiumStatus,
  loggedIn,
}: {
  item: Content;
  recommended: Content[];
  premiumStatus: PremiumStatus;
  loggedIn: boolean;
}) {
  const isSeries = item.type === "series";
  const browseHref = isSeries ? "/series" : "/movies";
  const browseLabel = isSeries ? "TV Shows" : "Movies";
  const seasonCount = item.seasons?.filter((s) => s.downloadUrl.trim()).length ?? 0;
  const backdrop = item.backdropImageUrl || item.posterImageUrl;

  return (
    <SitePage glow={false}>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0" aria-hidden>
          <Image
            src={backdrop}
            alt=""
            fill
            priority
            className="object-cover object-top"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/78 to-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_10%,rgba(34,197,94,0.18),transparent_52%)]" />
        </div>

        <div className="relative mx-auto max-w-screen-2xl px-4 pb-10 pt-[104px] sm:px-6 sm:pb-12 lg:px-10 lg:pb-14">
          <Link
            href={browseHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/55 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {browseLabel}
          </Link>

          <div className="mt-6 grid items-start gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-12">
            <div className="mx-auto w-44 sm:w-52 lg:mx-0 lg:w-full">
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.55)] ring-1 ring-white/15">
                <Image
                  src={item.posterImageUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 208px, 240px"
                />
              </div>
            </div>

            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
                  {isSeries ? "Series" : "Movie"}
                </span>
                {item.genres.map((g) => (
                  <Link
                    key={g}
                    href={genrePath(g)}
                    className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70 transition hover:border-emerald-400/40 hover:text-emerald-300"
                  >
                    {g}
                  </Link>
                ))}
              </div>

              <h1
                className="text-[2rem] font-bold leading-[1.05] text-white sm:text-4xl lg:text-[2.75rem]"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
              >
                {item.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-2.5 text-sm text-white/60">
                <QualityBadges qualities={item.qualities} />
                {item.rating && (
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-300">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {item.rating}
                  </span>
                )}
                {item.year && (
                  <span className="inline-flex items-center gap-1.5">
                    <Film className="h-3.5 w-3.5" />
                    {item.year}
                  </span>
                )}
                {item.runtime && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {item.runtime}
                  </span>
                )}
                {isSeries && seasonCount > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Tv className="h-3.5 w-3.5" />
                    {seasonCount} {seasonCount === 1 ? "season" : "seasons"}
                  </span>
                )}
              </div>

              {item.description && (
                <div className="mt-6">
                  <PlotText text={item.description} />
                </div>
              )}

              <div className="mt-8 flex flex-col gap-4 xl:flex-row xl:items-start">
                <div className="min-w-0 w-full max-w-xl">
                  <DownloadPanel
                    premiumStatus={premiumStatus}
                    loggedIn={loggedIn}
                    movieDownloadUrl={premiumStatus === "active" ? item.downloadUrl : undefined}
                    seasons={premiumStatus === "active" ? item.seasons : undefined}
                  />
                </div>
                <div className="w-full max-w-xl xl:max-w-xs xl:shrink-0">
                  <ShareBar item={item} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto max-w-screen-2xl px-4 pb-24 sm:px-6 lg:px-10 lg:pb-16">
        <RecommendedGrid items={recommended} browseHref={browseHref} type={item.type} />
      </div>

      <Footer />
    </SitePage>
  );
}
