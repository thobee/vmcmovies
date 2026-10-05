import Link from "next/link";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import type { Content } from "@/lib/catalog/types";
import { contentDetailPath } from "@/lib/catalog/paths";
import CatalogImage from "@/components/ui/CatalogImage";
import { resolveCatalogImage, resolvePosterImage } from "@/lib/catalog/image";
import QualityBadges from "@/components/media/QualityBadges";
import { cn } from "@/lib/cn";
import { contentAccessKind } from "@/lib/catalog/access";
import AccessBadge from "@/components/media/AccessBadge";

interface MovieCardProps {
  item: Content;
  landscape?: boolean;
  index?: number;
  className?: string;
  simple?: boolean;
}

export default function MovieCard({
  item,
  landscape = false,
  index = 0,
  className,
  simple = false,
}: MovieCardProps) {
  const imageSrc = landscape
    ? resolveCatalogImage(item.backdropImageUrl, item.posterImageUrl)
    : resolvePosterImage(item.posterImageUrl, item.backdropImageUrl);
  const accessKind = contentAccessKind(item);

  return (
    <Link
      href={contentDetailPath(item)}
      className={cn(
        "group relative flex-shrink-0 cursor-pointer",
        landscape
          ? "w-[232px] sm:w-[264px] md:w-[296px]"
          : "w-[148px] sm:w-[168px] md:w-[192px]",
        className,
      )}
      style={{ animationDelay: `${Math.min(index * 45, 270)}ms` }}
    >
      <div className="bezel-outer">
        <div
          className={cn(
            "bezel-inner relative overflow-hidden",
            landscape ? "aspect-video" : "aspect-[2/3]",
          )}
        >
          <CatalogImage
            src={imageSrc}
            alt={item.title}
            fill
            sizes={landscape ? "296px" : "192px"}
            className="transition-transform duration-500 group-hover:scale-[1.04]"
          />

          <div className="absolute inset-x-2 top-2 z-10 flex items-start justify-between gap-2">
            {!simple ? (
              <div className="flex min-w-0 flex-wrap items-start gap-1">
                <QualityBadges qualities={item.qualities} size="sm" hd />
                <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none text-black">
                  {item.type === "series" ? "Series" : "Movie"}
                </span>
              </div>
            ) : <span />}
            <AccessBadge kind={accessKind} />
          </div>

          {!simple && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/35">
              <div className="flex h-11 w-11 scale-90 items-center justify-center rounded-full bg-emerald-400 opacity-0 shadow-xl transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                <DownloadSimple className="h-5 w-5 text-black" weight="bold" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2.5 px-0.5">
        <p className="line-clamp-1 text-xs font-semibold leading-tight text-white/90 transition-colors group-hover:text-white sm:text-sm">
          {item.title}
        </p>
        {!simple && item.genres[0] && (
          <p className="mt-0.5 line-clamp-1 text-[10px] text-[var(--muted)] sm:text-xs">
            {item.genres[0]}
          </p>
        )}
      </div>
    </Link>
  );
}
