"use client";

import { useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import MovieCard from "@/components/media/MovieCard";
import ViewAllLink from "@/components/ui/ViewAllLink";
import type { Content } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";

interface ContentRailProps {
  title: string;
  items: Content[];
  viewAllHref?: string;
  landscape?: boolean;
  className?: string;
}

export default function ContentRail({
  title,
  items,
  viewAllHref,
  landscape = false,
  className,
}: ContentRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const syncScroll = () => {
    const el = railRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    syncScroll();
    const el = railRef.current;
    if (!el) return;
    const ro = new ResizeObserver(syncScroll);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items.length]);

  const scroll = (dir: "l" | "r") => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir === "l" ? -el.clientWidth * 0.72 : el.clientWidth * 0.72,
      behavior: "smooth",
    });
  };

  if (!items.length) return null;

  return (
    <section className={cn("group/rail relative w-full overflow-hidden", className)}>
      <div className="mb-5 flex items-end justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <div className="min-w-0">
          <h2
            className="text-lg font-bold text-white sm:text-[1.35rem]"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.025em" }}
          >
            {title}
          </h2>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/35 sm:text-xs">
            {items.length} {items.length === 1 ? "title" : "titles"}
          </p>
        </div>
        {viewAllHref && <ViewAllLink href={viewAllHref} className="hidden sm:inline-flex" />}
      </div>

      <div className="relative">
        <div
          ref={railRef}
          onScroll={syncScroll}
          className="flex gap-3.5 overflow-x-auto hide-scroll px-4 pb-1 sm:px-6 lg:gap-4 lg:px-10"
        >
          {items.map((item, i) => (
            <MovieCard key={item.id} item={item} landscape={landscape} index={i} />
          ))}
          <div className="w-2 flex-shrink-0" aria-hidden />
        </div>

        <div
          className={cn(
            "pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-black to-transparent transition-opacity duration-300 md:w-14",
            canScrollLeft ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-black to-transparent transition-opacity duration-300 md:w-14",
            canScrollRight ? "opacity-100" : "opacity-0",
          )}
        />

        <button
          type="button"
          onClick={() => scroll("l")}
          aria-label="Scroll left"
          className={cn(
            "absolute left-3 top-[38%] z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/12 bg-black/70 text-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md transition duration-200 hover:border-emerald-400/40 hover:bg-black/85 hover:text-emerald-300 md:flex",
            canScrollLeft
              ? "opacity-100"
              : "pointer-events-none opacity-0 group-hover/rail:opacity-40",
          )}
        >
          <CaretLeft className="h-4.5 w-4.5" weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => scroll("r")}
          aria-label="Scroll right"
          className={cn(
            "absolute right-3 top-[38%] z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/12 bg-black/70 text-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md transition duration-200 hover:border-emerald-400/40 hover:bg-black/85 hover:text-emerald-300 md:flex",
            canScrollRight
              ? "opacity-100"
              : "pointer-events-none opacity-0 group-hover/rail:opacity-40",
          )}
        >
          <CaretRight className="h-4.5 w-4.5" weight="bold" />
        </button>
      </div>

      {viewAllHref && (
        <div className="mt-4 flex justify-center px-4 sm:hidden">
          <ViewAllLink href={viewAllHref} className="w-full justify-center" />
        </div>
      )}
    </section>
  );
}
