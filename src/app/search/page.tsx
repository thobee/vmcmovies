"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CircleNotch, FilmStrip, MagnifyingGlass, MagnifyingGlassMinus, Television } from "@phosphor-icons/react";
import MovieCard from "@/components/media/MovieCard";
import SitePage from "@/components/layout/SitePage";
import Footer from "@/components/layout/Footer";
import { contentDetailPath } from "@/lib/catalog/paths";
import type { Content } from "@/lib/catalog/types";
import { useCatalogSearch } from "@/hooks/useCatalogSearch";
import { cn } from "@/lib/cn";

function SearchInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const { results, loading } = useCatalogSearch(query, 320);
  const trimmed = query.trim();
  const searched = trimmed.length >= 2;

  useEffect(() => {
    setQuery(initialQ);
  }, [initialQ]);

  const syncUrl = (q: string) => {
    const next = q.trim();
    router.replace(next ? `/search?q=${encodeURIComponent(next)}` : "/search", { scroll: false });
  };

  return (
    <>
      <div className="relative border-b border-white/10 px-4 pb-8 pt-[104px] sm:px-6 lg:px-10">
        <div className="home-hero-glow pointer-events-none absolute inset-x-0 top-0 h-56" aria-hidden />
        <div className="relative mx-auto max-w-screen-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Find</p>
          <h1
            className="mt-3 text-[2.25rem] font-bold leading-[1.05] text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
          >
            Search catalog
          </h1>
          <p className="mt-3 max-w-lg text-[15px] leading-7 text-white/65">
            Type to see movies and series instantly. Results update as you search.
          </p>

          <div className="relative mt-8 max-w-2xl">
            <MagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" weight="bold" />
            <input
              type="text"
              inputMode="search"
              enterKeyHint="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                syncUrl(e.target.value);
              }}
              placeholder="Search movies, TV shows, genres..."
              className="w-full rounded-2xl border border-white/10 bg-[#101214] py-4 pl-11 pr-4 text-sm text-white shadow-none outline-none ring-0 transition placeholder:text-white/35 focus:border-emerald-400/50 focus:outline-none focus:ring-0"
              autoFocus
            />
          </div>

          {searched && results.length > 0 && (
            <div className="mt-4 max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#101214]">
              <p className="border-b border-white/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">
                Quick picks
              </p>
              <ul>
                {results.slice(0, 5).map((item) => (
                  <li key={item.id}>
                    <Link
                      href={contentDetailPath(item)}
                      className="flex items-center gap-3 px-4 py-3 transition hover:bg-emerald-500/10"
                    >
                      <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-md bg-white/5 ring-1 ring-white/10">
                        <Image src={item.posterImageUrl} alt="" fill sizes="36px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-0.5 flex items-center gap-2 text-[11px] text-white/45">
                          <span className="inline-flex items-center gap-1">
                            {item.type === "series" ? (
                              <Television className="h-3 w-3" weight="light" />
                            ) : (
                              <FilmStrip className="h-3 w-3" weight="light" />
                            )}
                            {item.type === "series" ? "Series" : "Movie"}
                          </span>
                          {item.year && <span>{item.year}</span>}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        {loading && searched && (
          <div className="flex items-center justify-center gap-2.5 py-20 text-sm text-white/50">
            <CircleNotch className="h-5 w-5 animate-spin text-emerald-400" weight="bold" />
            Searching…
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="rounded-[28px] border border-white/10 bg-[#101214] px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
              <MagnifyingGlassMinus className="h-6 w-6 text-white/30" weight="light" />
            </div>
            <p className="text-lg font-semibold text-white">No results for &ldquo;{trimmed}&rdquo;</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/55">
              Try a different title, genre, or spelling.
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="mb-6 text-sm text-white/45">
              <span className="font-semibold text-white/75">{results.length}</span>{" "}
              {results.length === 1 ? "result" : "results"} for &ldquo;{trimmed}&rdquo;
            </p>
            <div
              className={cn(
                "grid gap-x-3 gap-y-8 sm:gap-x-4",
                "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
              )}
            >
              {results.map((item, i) => (
                <MovieCard key={item.id} item={item} index={i} className="w-full" />
              ))}
            </div>
          </>
        )}

        {!searched && (
          <div className="rounded-[28px] border border-white/10 bg-[#101214] px-6 py-20 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
              <MagnifyingGlass className="h-6 w-6 text-emerald-400" weight="light" />
            </div>
            <p className="text-lg font-semibold text-white">Start typing to search</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/55">
              Movies and series appear as you type — at least 2 characters.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <SitePage>
      <Suspense
        fallback={
          <div className="flex justify-center py-24">
            <CircleNotch className="h-6 w-6 animate-spin text-emerald-400" weight="bold" />
          </div>
        }
      >
        <SearchInner />
      </Suspense>
      <Footer />
    </SitePage>
  );
}
