"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowsDownUp, FilmStrip, MagnifyingGlass, Television, X } from "@phosphor-icons/react";
import MovieCard from "@/components/media/MovieCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import type { Content } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";

type SortKey = "newest" | "title" | "rating";
type TypeFilter = "all" | "movie" | "series";

const GRID =
  "grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

export default function GenreCatalogClient({
  movies,
  series,
  genreName,
}: {
  movies: Content[];
  series: Content[];
  genreName: string;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const pool = useMemo(() => {
    if (typeFilter === "movie") return movies;
    if (typeFilter === "series") return series;
    return [...movies, ...series];
  }, [movies, series, typeFilter]);

  const total = movies.length + series.length;

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = pool;

    if (q) {
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q),
      );
    }

    return [...list].sort((a, b) => {
      if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
      if (sort === "title") return a.title.localeCompare(b.title);
      return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
    });
  }, [pool, query, sort]);

  const filters = [
    { id: "all" as const, label: "All", count: total },
    { id: "movie" as const, label: "Movies", count: movies.length, icon: FilmStrip },
    { id: "series" as const, label: "TV Shows", count: series.length, icon: Television },
  ];

  return (
    <div>
      <div className="sticky top-[72px] z-30 -mx-4 mb-8 border-b border-white/10 bg-black/90 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <MagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" weight="bold" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${genreName} titles…`}
              className="w-full rounded-2xl border border-white/10 bg-[#101214] py-3 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/15"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" weight="bold" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ArrowsDownUp className="h-4 w-4 text-white/35" weight="bold" />
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-[148px] border-white/10 bg-[#101214] hover:border-emerald-400/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="title">A – Z</SelectItem>
                <SelectItem value="rating">Top rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {filters.map(({ id, label, count, icon: Icon }) => {
            const on = typeFilter === id;
            const disabled = count === 0;
            return (
              <button
                key={id}
                type="button"
                disabled={disabled}
                onClick={() => setTypeFilter(id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition duration-200",
                  on
                    ? "border-emerald-400/50 bg-emerald-500 text-black"
                    : "border-white/10 bg-white/[0.04] text-white/65 hover:border-emerald-400/35 hover:text-emerald-300",
                  disabled && "cursor-not-allowed opacity-40",
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5" weight="bold" />}
                {label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px]",
                    on ? "bg-black/15 text-black/70" : "bg-white/10 text-white/50",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-sm text-white/45">
          Showing <span className="font-semibold text-white/75">{items.length}</span> of{" "}
          <span className="font-semibold text-white/75">{pool.length}</span> in {genreName}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[28px] border border-white/10 bg-[#101214] px-6 py-16 text-center">
          <p className="text-lg font-semibold text-white">No titles found</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/55">
            {query
              ? `Nothing matched “${query}” in ${genreName}. Try another search or switch the filter.`
              : total === 0
                ? `Nothing has been tagged ${genreName} yet.`
                : "No titles match this filter."}
          </p>
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-6 inline-flex rounded-full border border-white/12 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
            >
              Clear search
            </button>
          ) : (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/movies" className="auth-btn px-5 py-2.5 text-sm">
                Browse movies
              </Link>
              <Link
                href="/series"
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Browse TV shows
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className={GRID}>
          {items.map((item, i) => (
            <MovieCard key={item.id} item={item} index={i} className="w-full" />
          ))}
        </div>
      )}
    </div>
  );
}
