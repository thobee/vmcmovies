"use client";

import { useMemo, useState } from "react";
import MovieCard from "@/components/media/MovieCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import type { Content } from "@/lib/catalog/types";
import { KNOWN_GENRES } from "@/lib/catalog/genres";

type GenreKey = "all" | string;

interface CatalogGridClientProps {
  initialItems: Content[];
  type: "movie" | "series";
}

export default function CatalogGridClient({ initialItems, type }: CatalogGridClientProps) {
  const [genre, setGenre] = useState<GenreKey>("all");

  const genres = useMemo(() => {
    const fromCatalog = new Set<string>();
    for (const item of initialItems) {
      for (const itemGenre of item.genres) fromCatalog.add(itemGenre);
    }

    const merged = KNOWN_GENRES.filter((itemGenre) => fromCatalog.has(itemGenre));
    for (const itemGenre of fromCatalog) {
      if (!merged.includes(itemGenre)) merged.push(itemGenre);
    }
    return merged.sort((a, b) => a.localeCompare(b));
  }, [initialItems]);

  const items = useMemo(() => {
    return initialItems.filter((item) => {
      return genre === "all" || item.genres.includes(genre);
    });
  }, [initialItems, genre]);

  const label = type === "series" ? "series" : "movies";
  const hasFilters = genre !== "all";

  const resetFilters = () => {
    setGenre("all");
  };

  return (
    <div>
      <div className="mb-7 flex justify-end">
        <div className="w-full min-w-0 sm:max-w-64">
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger aria-label="Filter by genre" className="min-h-12 w-full border-0 bg-black/30 px-4 ring-1 ring-inset ring-white/[0.07]">
              <SelectValue placeholder="All genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All genres</SelectItem>
              {genres.map((itemGenre) => (
                <SelectItem key={itemGenre} value={itemGenre}>
                  {itemGenre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-white/40">
          <span className="font-semibold text-white/75">{items.length}</span>{" "}
          {items.length === 1 ? "title" : "titles"}
          {hasFilters && items.length !== initialItems.length ? ` from ${initialItems.length}` : ""}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-semibold text-white/45 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white"
          >
            Clear genre
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-[28px] bg-white/[0.035] p-1.5 ring-1 ring-inset ring-white/[0.08]">
          <div className="rounded-[22px] bg-[#101214] px-6 py-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <p className="text-lg font-semibold text-white">No {label} found</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/50">
              There are no {label} in this genre yet. Choose another genre to keep browsing.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 inline-flex rounded-full bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/10 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.1]"
            >
              Clear filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item, index) => (
            <MovieCard key={item.id} item={item} index={index} className="w-full" />
          ))}
        </div>
      )}
    </div>
  );
}
