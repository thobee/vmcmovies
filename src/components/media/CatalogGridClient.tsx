"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowsDownUp, MagnifyingGlass, SlidersHorizontal, X } from "@phosphor-icons/react";
import MovieCard from "@/components/media/MovieCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import type { Content } from "@/lib/catalog/types";
import { genrePath, KNOWN_GENRES } from "@/lib/catalog/genres";
import { cn } from "@/lib/cn";

type SortKey = "newest" | "title" | "rating";

interface CatalogGridClientProps {
  initialItems: Content[];
  type: "movie" | "series";
}

export default function CatalogGridClient({ initialItems, type }: CatalogGridClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const genres = useMemo(() => {
    const fromCatalog = new Set<string>();
    for (const item of initialItems) {
      for (const g of item.genres) fromCatalog.add(g);
    }
    const merged: string[] = [...KNOWN_GENRES.filter((g) => fromCatalog.has(g))];
    for (const g of fromCatalog) {
      if (!merged.includes(g)) merged.push(g);
    }
    return merged.sort((a, b) => a.localeCompare(b));
  }, [initialItems]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = initialItems;

    if (q) {
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.genres.some((genre) => genre.toLowerCase().includes(q)),
      );
    }

    return [...list].sort((a, b) => {
      if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
      if (sort === "title") return a.title.localeCompare(b.title);
      return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
    });
  }, [initialItems, query, sort]);

  const label = type === "series" ? "series" : "movies";

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
              placeholder={`Search ${label}…`}
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

          <div className="flex flex-wrap items-center gap-2.5">
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

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-white/35" weight="bold" />
              <Select
                value="all"
                onValueChange={(v) => {
                  if (v !== "all") router.push(genrePath(v));
                }}
              >
                <SelectTrigger className="w-[156px] border-white/10 bg-[#101214] hover:border-emerald-400/30 sm:w-[172px]">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All genres</SelectItem>
                  {genres.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {genres.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto hide-scroll pb-0.5">
            {genres.slice(0, 10).map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => router.push(genrePath(genre))}
                className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-white/65 transition hover:border-emerald-400/35 hover:bg-emerald-500/10 hover:text-emerald-300"
              >
                {genre}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-white/45">
          Showing <span className="font-semibold text-white/75">{items.length}</span> of{" "}
          <span className="font-semibold text-white/75">{initialItems.length}</span>
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[28px] border border-white/10 bg-[#101214] px-6 py-16 text-center">
          <p className="text-lg font-semibold text-white">No {label} found</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/55">
            {query
              ? `Nothing matched “${query}”. Try another title or clear your search.`
              : `Your ${label} catalog is empty right now.`}
          </p>
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-6 inline-flex rounded-full border border-white/12 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-x-3 gap-y-8 sm:gap-x-4",
            "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
          )}
        >
          {items.map((item, i) => (
            <MovieCard key={item.id} item={item} index={i} className="w-full" />
          ))}
        </div>
      )}
    </div>
  );
}
