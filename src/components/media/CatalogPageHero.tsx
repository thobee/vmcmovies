import type { ReactNode } from "react";
import CatalogBrowseTabs from "@/components/media/CatalogBrowseTabs";

export default function CatalogPageHero({
  eyebrow,
  title,
  description,
  count,
  activeTab,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  count: number;
  activeTab: "movies" | "series";
  children?: ReactNode;
}) {
  return (
    <div className="relative border-b border-white/10 px-4 pb-8 pt-[104px] sm:px-6 lg:px-10">
      <div className="home-hero-glow pointer-events-none absolute inset-x-0 top-0 h-56" aria-hidden />

      <div className="relative mx-auto max-w-screen-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
              {eyebrow}
            </p>
            <h1
              className="mt-3 text-[2.25rem] font-bold leading-[1.05] text-white sm:text-5xl"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
            >
              {title}
            </h1>
            <p className="mt-3 max-w-lg text-[15px] leading-7 text-white/65">{description}</p>
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
