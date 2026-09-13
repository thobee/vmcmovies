import Link from "next/link";
import Image from "next/image";
import { Download } from "lucide-react";
import type { Content } from "@/lib/catalog/types";
import { contentDetailPath } from "@/lib/catalog/paths";
import QualityBadges from "@/components/media/QualityBadges";
import { cn } from "@/lib/cn";

interface MovieCardProps {
  item: Content;
  landscape?: boolean;
  index?: number;
  className?: string;
  /** No quality/type badges; title only (recommended grid). */
  simple?: boolean;
}

/** Plex-style card: clean poster, badges on the art, title + genre below. */
export default function MovieCard({
  item,
  landscape = false,
  index = 0,
  className,
  simple = false,
}: MovieCardProps) {
  return (
    <Link
      href={contentDetailPath(item)}
      className={cn(
        "group relative flex-shrink-0 cursor-pointer",
        landscape
          ? "w-[232px] sm:w-[264px] md:w-[296px]"
          : "w-[168px] sm:w-[192px] md:w-[216px]",
        className
      )}
      style={{ animationDelay: `${Math.min(index * 45, 270)}ms` }}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/8",
          landscape ? "aspect-video" : "aspect-[2/3]"
        )}
      >
        <Image
          src={
            landscape && item.backdropImageUrl
              ? item.backdropImageUrl
              : item.posterImageUrl
          }
          alt={item.title}
          fill
          sizes={landscape ? "296px" : "216px"}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {!simple && (
          <div className="absolute top-2 left-2 right-2 z-10 flex flex-wrap items-start gap-1">
            <QualityBadges qualities={item.qualities} size="sm" hd />
            <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none text-black">
              {item.type === "series" ? "Series" : "Movie"}
            </span>
          </div>
        )}

        {!simple && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg)]/0 group-hover:bg-[var(--bg)]/35 transition-colors duration-250">
            <div className="flex h-11 w-11 scale-90 items-center justify-center rounded-full bg-emerald-400 opacity-0 shadow-xl shadow-emerald-950/40 transition-all duration-250 group-hover:scale-100 group-hover:opacity-100">
              <Download className="h-5 w-5 text-black" />
            </div>
          </div>
        )}

        <div className="absolute inset-0 rounded-xl ring-0 ring-emerald-400/0 transition group-hover:ring-2 group-hover:ring-emerald-400/50" />
      </div>

      <div className="pt-2 px-0.5">
        <p className="text-white/90 text-xs sm:text-sm font-semibold leading-tight line-clamp-1 group-hover:text-white transition-colors">
          {item.title}
        </p>
        {!simple && item.genres[0] && (
          <p className="text-[var(--muted)] text-[10px] sm:text-xs mt-0.5 line-clamp-1">
            {item.genres[0]}
          </p>
        )}
      </div>
    </Link>
  );
}
