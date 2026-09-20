"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { DownloadSimple, Info } from "@phosphor-icons/react";
import type { Content } from "@/lib/catalog/types";
import type { HeroSlide } from "@/lib/site/types";
import { contentDetailPath } from "@/lib/catalog/paths";
import { resolveHeroImage } from "@/lib/catalog/image";
import CatalogImage from "@/components/ui/CatalogImage";
import QualityBadges from "@/components/media/QualityBadges";

type Featured = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  heroSrc: string;
  heroFallback?: string;
  ctaLabel: string;
  ctaHref: string;
  year?: string;
  rating?: string;
  qualities?: Content["qualities"];
  type?: Content["type"];
};

function fromContent(item: Content): Featured {
  return {
    id: item.id,
    eyebrow: "Now featured",
    title: item.title,
    description: item.description,
    heroSrc: item.backdropImageUrl ?? "",
    heroFallback: item.posterImageUrl,
    ctaLabel: "View details",
    ctaHref: contentDetailPath(item),
    year: item.year,
    rating: item.rating,
    qualities: item.qualities,
    type: item.type,
  };
}

function slideSource(slide: HeroSlide, fallback: Content, catalog: Content[]): Content {
  const href = slide.ctaHref?.trim();
  if (!href) return fallback;
  return catalog.find((item) => contentDetailPath(item) === href) ?? fallback;
}

function fromSlide(slide: HeroSlide, fallback: Content, catalog: Content[]): Featured {
  const source = slideSource(slide, fallback, catalog);
  const override = slide.imageUrl?.trim();
  return {
    id: slide.id,
    eyebrow: slide.eyebrow?.trim() || "Now featured",
    title: slide.title,
    description: slide.description?.trim() || "",
    heroSrc: override || source.backdropImageUrl || "",
    heroFallback: source.posterImageUrl,
    ctaLabel: slide.ctaLabel?.trim() || "View details",
    ctaHref: slide.ctaHref?.trim() || "/get-access",
  };
}

export default function FeaturedStrip({
  slides,
  fallback,
  catalog = [],
}: {
  slides: HeroSlide[];
  fallback: Content;
  catalog?: Content[];
}) {
  const fallbackHero = resolveHeroImage(
    fallback.backdropImageUrl,
    fallback.posterImageUrl,
  );

  const enabledSlides = slides.filter(
    (s) => s.enabled && s.title.trim() && (s.imageUrl.trim() || fallbackHero),
  );

  const items =
    enabledSlides.length > 0
      ? enabledSlides.map((s) => fromSlide(s, fallback, catalog))
      : [fromContent(fallback)];

  const [index, setIndex] = useState(0);
  const active = items[index] ?? items[0];

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = window.setInterval(next, 7000);
    return () => window.clearInterval(timer);
  }, [items.length, next]);

  if (!active) return null;

  return (
    <section className="relative px-4 pt-[88px] sm:px-6 sm:pt-[92px] lg:px-10">
      <div className="home-hero-glow pointer-events-none absolute inset-x-0 top-0 h-72" aria-hidden />

      <div className="bezel-outer relative mx-auto max-w-screen-2xl">
        <div className="bezel-inner relative overflow-hidden border border-white/[0.08] bg-[#0a0a0a] shadow-[0_24px_80px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.06)]">
          <div className="relative isolate min-h-[clamp(300px,58vw,480px)] w-full">
            {items.map((item, i) => (
              <div
                key={item.id}
                className="absolute inset-0 z-0 transition-opacity duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={{
                  opacity: i === index ? 1 : 0,
                  pointerEvents: i === index ? "auto" : "none",
                }}
                aria-hidden={i !== index}
              >
                <CatalogImage
                  src={item.heroSrc}
                  fallback={item.heroFallback}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1536px) 100vw, 1536px"
                  className="object-cover object-[center_22%]"
                />
              </div>
            ))}

            <div
              className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-black/88 via-black/50 to-black/15"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/80 via-black/25 to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_80%_20%,rgba(34,197,94,0.14),transparent_50%)]"
              aria-hidden
            />

            <div className="relative z-[2] flex min-h-[clamp(300px,58vw,480px)] flex-col justify-end p-5 sm:p-7 lg:p-9">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                className="min-w-0 max-w-2xl pb-0.5"
              >
                <p className="eyebrow-pill mb-2">{active.eyebrow}</p>
                <h1
                  className="mb-3 max-w-xl text-[1.75rem] font-semibold leading-[1.05] text-white sm:text-[2.15rem] md:text-[2.35rem] lg:text-[2.75rem]"
                  style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
                >
                  {active.title}
                </h1>
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-white/55">
                  {active.qualities && <QualityBadges qualities={active.qualities} size="sm" hd />}
                  {active.type && (
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                      {active.type === "series" ? "Series" : "Movie"}
                    </span>
                  )}
                  {active.year && <span>{active.year}</span>}
                  {active.rating && <span className="text-amber-300">★ {active.rating}</span>}
                </div>
                {active.description && (
                  <p className="mb-5 max-w-lg line-clamp-2 text-sm leading-relaxed text-white/55 sm:text-[15px]">
                    {active.description}
                  </p>
                )}
                <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
                  <Link href={active.ctaHref} className="btn-nested-primary w-full justify-between sm:w-auto">
                    {active.ctaLabel}
                    <span className="btn-nested-icon bg-black/10">
                      <Info className="h-4 w-4" weight="bold" />
                    </span>
                  </Link>
                  <Link href="/get-access" className="btn-nested-ghost w-full justify-between sm:w-auto">
                    Get premium
                    <span className="btn-nested-icon bg-white/10">
                      <DownloadSimple className="h-4 w-4" weight="bold" />
                    </span>
                  </Link>
                </div>
                {items.length > 1 && (
                  <div className="mt-5 flex items-center gap-1.5">
                    {items.map((item, i) => (
                      <button
                        key={item.id}
                        type="button"
                        aria-label={`Show ${item.title}`}
                        onClick={() => setIndex(i)}
                        className={
                          i === index
                            ? "h-1.5 w-6 rounded-full bg-emerald-400"
                            : "h-1.5 w-1.5 rounded-full bg-white/25 hover:bg-white/50"
                        }
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
