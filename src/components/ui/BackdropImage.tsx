"use client";

import { POSTER_PLACEHOLDER, resolveCatalogImage } from "@/lib/catalog/image";
import { cn } from "@/lib/cn";

type BackdropImageProps = {
  src?: string | null;
  fallback?: string | null;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
};

/** Full-bleed backdrop — native img avoids Next/Image fill sizing issues in heroes. */
export default function BackdropImage({
  src,
  fallback,
  className,
  imgClassName,
  priority,
}: BackdropImageProps) {
  const url = resolveCatalogImage(src, fallback);

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <img
        src={url}
        alt=""
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={cn("absolute inset-0 h-full w-full object-cover", imgClassName)}
        referrerPolicy="no-referrer"
        onError={(e) => {
          const img = e.currentTarget;
          if (img.src !== POSTER_PLACEHOLDER) img.src = POSTER_PLACEHOLDER;
        }}
      />
    </div>
  );
}
