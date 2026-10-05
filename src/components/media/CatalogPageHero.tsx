import type { ReactNode } from "react";
import CatalogBrowseTabs from "@/components/media/CatalogBrowseTabs";
import CatalogImage from "@/components/ui/CatalogImage";
import { resolvePosterImage } from "@/lib/catalog/image";
import type { Content } from "@/lib/catalog/types";

export default function CatalogPageHero({
  eyebrow,
  title,
  description,
  count,
  activeTab,
  backdrop,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  count: number;
  activeTab: "movies" | "series";
  backdrop?: Content;
  children?: ReactNode;
}) {
  return (
    <div className="relative isolate overflow-hidden border-b border-white/[0.08] px-4 pb-9 pt-[112px] sm:px-6 sm:pb-11 lg:px-10">
      {backdrop && (
        <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden>
          <CatalogImage
            src={resolvePosterImage(backdrop.posterImageUrl, backdrop.backdropImageUrl)}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[72%_38%] opacity-40"
          />
        </div>
      )}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,#060809_0%,rgba(6,8,9,0.94)_34%,rgba(6,8,9,0.66)_65%,rgba(6,8,9,0.82)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-[#060809] to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-screen-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow-pill">{eyebrow}</p>
            <h1
              className="mt-4 text-[2rem] font-semibold leading-[1.05] text-white sm:text-5xl"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
            >
              {title}
            </h1>
            <p className="mt-3 max-w-lg text-[15px] leading-7 text-white/70">{description}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/35">
              {count} {count === 1 ? "title" : "titles"} available
            </p>
          </div>

          <CatalogBrowseTabs active={activeTab} />
        </div>

        {children}
      </div>
    </div>
  );
}
