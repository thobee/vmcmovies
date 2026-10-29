import Link from "next/link";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import type { Content } from "@/lib/catalog/types";
import { contentDetailPath } from "@/lib/catalog/paths";
import CatalogImage from "@/components/ui/CatalogImage";
import { resolveCatalogImage, resolvePosterImage } from "@/lib/catalog/image";
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
  const quality = item.qualities?.length ? (item.qualities.includes("4K") ? "4K" : "HD") : null;

  return (
    <Link
      href={contentDetailPath(item)}
      title={item.title}
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
            className="transition-transform duration-300 group-hover:scale-[1.04]"
          />

          <div className="absolute right-2 top-2 z-10">
            <AccessBadge kind={accessKind} />
          </div>

          {!simple && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/35">
              <div className="flex h-11 w-11 scale-90 items-center justify-center rounded-full bg-emerald-400 opacity-0 shadow-xl transition-[opacity,scale] duration-200 ease-out group-hover:scale-100 group-hover:opacity-100">
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
        {!simple && (
          <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-white/55">
            {quality && (
              <span className="shrink-0 rounded border border-white/20 px-1 text-[10px] font-bold leading-4 text-white/75">
                {quality}
              </span>
            )}
            <span className="min-w-0 truncate">
              {[item.genres[0], item.year].filter(Boolean).join(" · ")}
            </span>
            {item.rating && (
              <span className="ml-auto shrink-0 tabular-nums text-amber-300">★ {item.rating}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
