import Link from "next/link";
import { FilmStrip, Sparkle, Television } from "@phosphor-icons/react/dist/ssr";
import { genrePath } from "@/lib/catalog/genres";
import { cn } from "@/lib/cn";

export default function GenrePageHero({
  genreName,
  movieCount,
  seriesCount,
  allGenres,
}: {
  genreName: string;
  movieCount: number;
  seriesCount: number;
  allGenres: string[];
}) {
  const total = movieCount + seriesCount;

  return (
    <div className="relative border-b border-white/10 px-4 pb-8 pt-[104px] sm:px-6 lg:px-10">
      <div className="home-hero-glow pointer-events-none absolute inset-x-0 top-0 h-56" aria-hidden />

      <div className="relative mx-auto max-w-screen-2xl">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-white/45">
          <Link href="/movies" className="transition hover:text-emerald-300">
            Movies
          </Link>
          <span aria-hidden>·</span>
          <Link href="/series" className="transition hover:text-emerald-300">
            TV Shows
          </Link>
        </div>

        <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow-pill gap-2">
              <Sparkle className="h-3.5 w-3.5" weight="fill" />
              Browse by genre
            </p>
            <h1
              className="mt-3 text-[2.25rem] font-bold leading-[1.05] text-white sm:text-5xl"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
            >
              {genreName}
            </h1>
            <p className="mt-3 max-w-lg text-[15px] leading-7 text-white/65">
              {total > 0
                ? `Movies and series tagged ${genreName.toLowerCase()} in the VMC catalog.`
                : `No titles in ${genreName} yet — check back soon or browse the full catalog.`}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-white/70">
                <FilmStrip className="h-3.5 w-3.5 text-emerald-400" weight="light" />
                {movieCount} {movieCount === 1 ? "movie" : "movies"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-white/70">
                <Television className="h-3.5 w-3.5 text-emerald-400" weight="light" />
                {seriesCount} {seriesCount === 1 ? "series" : "series"}
              </span>
            </div>
          </div>
        </div>

        {allGenres.length > 0 && (
          <div className="mt-8 flex gap-2 overflow-x-auto hide-scroll pb-0.5">
            {allGenres.map((genre) => {
              const active = genre.toLowerCase() === genreName.toLowerCase();
              return (
                <Link
                  key={genre}
                  href={genrePath(genre)}
                  className={cn(
                    "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition duration-200",
                    active
                      ? "border-emerald-400/50 bg-emerald-500 text-black shadow-[0_4px_16px_rgba(34,197,94,0.3)]"
                      : "border-white/10 bg-white/[0.04] text-white/65 hover:border-emerald-400/35 hover:bg-emerald-500/10 hover:text-emerald-300",
                  )}
                >
                  {genre}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
