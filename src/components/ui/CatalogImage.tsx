import Image from "next/image";
import {
  isDataImage,
  POSTER_PLACEHOLDER,
  resolveCatalogImage,
  resolveHeroImage,
  resolvePosterImage,
} from "@/lib/catalog/image";
import { cn } from "@/lib/cn";

type CatalogImageProps = {
  src?: string | null;
  fallback?: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/** Next/Image wrapper with safe fallbacks for empty catalog URLs. */
export default function CatalogImage({
  src,
  fallback,
  alt,
  fill,
  width,
  height,
  sizes,
  priority,
  className,
}: CatalogImageProps) {
  const resolved = resolveCatalogImage(src, fallback);
  const unoptimized = isDataImage(resolved);

  if (fill) {
    return (
      <div className="relative h-full w-full">
        <Image
          src={resolved}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={unoptimized}
          referrerPolicy={unoptimized ? undefined : "no-referrer"}
          className={cn("object-cover", className)}
        />
      </div>
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      width={width ?? 500}
      height={height ?? 750}
      sizes={sizes}
      priority={priority}
      unoptimized={unoptimized}
      referrerPolicy={unoptimized ? undefined : "no-referrer"}
      className={cn("object-cover", className)}
    />
  );
}

export {
  POSTER_PLACEHOLDER,
  resolveCatalogImage,
  resolveHeroImage,
  resolvePosterImage,
  isDataImage,
};
