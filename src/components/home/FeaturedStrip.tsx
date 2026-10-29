"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, CaretLeft, CaretRight, Info, ShieldCheck } from "@phosphor-icons/react";
import type { Content } from "@/lib/catalog/types";
import type { HeroSlide } from "@/lib/site/types";
import { contentDetailPath } from "@/lib/catalog/paths";
import { resolveHeroImage } from "@/lib/catalog/image";
import CatalogImage from "@/components/ui/CatalogImage";
import QualityBadges from "@/components/media/QualityBadges";
import TelegramIcon from "@/components/brand/TelegramIcon";

type Featured = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  heroSrc: string;
  heroFallback?: string;
  posterSrc?: string;
  ctaLabel: string;
  ctaHref: string;
  year?: string;
  rating?: string;
  qualities?: Content["qualities"];
  type?: Content["type"];
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0.7,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0.7,
  }),
};

function fromContent(item: Content): Featured {
  return {
    id: item.id,
    eyebrow: "Now featured",
    title: item.title,
    description: item.description,
    heroSrc: item.backdropImageUrl ?? "",
    heroFallback: item.posterImageUrl,
    posterSrc: item.posterImageUrl,
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
    posterSrc: source.posterImageUrl,
    ctaLabel: slide.ctaLabel?.trim() || "View details",
    ctaHref: slide.ctaHref?.trim() || "/get-access",
    year: source.year,
    rating: source.rating,
    qualities: source.qualities,
    type: source.type,
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
  const [direction, setDirection] = useState(1);
  // Auto-rotation stops while the hero is hovered or focused, and never runs for reduced-motion users.
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const active = items[index] ?? items[0];

  const count = items.length;

  const next = () => {
    setDirection(1);
    setIndex((i) => (i + 1) % count);
  };

  const previous = () => {
    setDirection(-1);
    setIndex((i) => (i - 1 + count) % count);
  };

  const goTo = (nextIndex: number) => {
    if (nextIndex === index) return;
    setDirection(nextIndex > index ? 1 : -1);
    setIndex(nextIndex);
  };

  useEffect(() => {
    if (count <= 1 || paused || reduceMotion) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % count);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [count, paused, reduceMotion]);

  if (!active) return null;

  // Slides that point at a title lead with the real action; custom admin labels are kept as-is.
  const opensTitle = /^\/(movie|series)\//.test(active.ctaHref);
  const primaryLabel = opensTitle && active.ctaLabel === "View details" ? "Download on Telegram" : active.ctaLabel;

  return (
    <section className="relative px-4 pt-[88px] sm:px-6 sm:pt-[92px] lg:px-10">
      <div className="home-hero-glow pointer-events-none absolute inset-x-0 top-0 h-72" aria-hidden />

      <div
        className="bezel-outer relative mx-auto max-w-screen-2xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
        }}
      >
        <div className="bezel-inner relative overflow-hidden border border-white/[0.08] bg-[#0a0a0a] shadow-[0_24px_80px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.06)]">
          <div className="relative isolate min-h-[clamp(300px,58vw,480px)] w-full">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={active.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.72, ease: [0.32, 0.72, 0, 1] }}
                className="absolute inset-0 z-0"
              >
                <CatalogImage
                  src={active.heroSrc}
                  fallback={active.heroFallback}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1536px) 100vw, 1536px"
                  className="object-cover object-[center_22%]"
                />
              </motion.div>
            </AnimatePresence>

            <div
              className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-black/90 via-black/48 to-black/5"
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

            <div className="absolute inset-x-5 top-5 z-[3] flex sm:inset-x-7 sm:top-6 lg:inset-x-9 lg:top-8">
              <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-black/45 py-1.5 pl-2 pr-3.5 text-xs font-medium text-white/85 backdrop-blur-md sm:text-[13px]">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#2AABEE] text-white">
                  <TelegramIcon className="h-3.5 w-3.5" />
                </span>
                <span className="truncate sm:hidden">
                  Verified titles <span className="text-white/40" aria-hidden>·</span> Sent to your Telegram
                </span>
                <span className="hidden truncate sm:inline">
                  Verified movies &amp; series <span className="text-white/40" aria-hidden>·</span> Delivered to your Telegram
                </span>
              </p>
            </div>

            <div className="relative z-[2] flex min-h-[clamp(360px,58vw,520px)] items-end p-5 pt-20 sm:p-7 sm:pt-24 lg:p-9 lg:pt-28">
              <div className="grid w-full items-end gap-7 md:grid-cols-[minmax(0,1fr)_minmax(13rem,18rem)] lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)]">
                <motion.div
                  key={`${active.id}-copy`}
                  initial={{ opacity: 0, x: direction > 0 ? 22 : -22 }}
                  animate={{ opacity: 1, x: 0 }}
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
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
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
                      {primaryLabel}
                      <span className="btn-nested-icon bg-black/10">
                        {opensTitle ? <TelegramIcon className="h-4 w-4" /> : <Info className="h-4 w-4" weight="bold" />}
                      </span>
                    </Link>
                    <Link href="/get-access" className="btn-nested-ghost w-full justify-between sm:w-auto">
                      See Premium plans
                      <span className="btn-nested-icon bg-white/10">
                        <ArrowRight className="h-4 w-4" weight="bold" />
                      </span>
                    </Link>
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-white/55">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" weight="fill" />
                    Free titles need only an account. Premium has no auto-renewal.
                  </p>
                  {items.length > 1 && (
                    <div className="mt-5 flex items-center gap-3">
                      <div className="-mx-1.5 flex items-center" aria-label="Featured titles">
                        {items.map((item, i) => (
                          <button
                            key={item.id}
                            type="button"
                            aria-label={`Show ${item.title}`}
                            aria-current={i === index ? "true" : undefined}
                            onClick={() => goTo(i)}
                            className="group/dot grid h-8 place-items-center px-1.5"
                          >
                            <span
                              className={
                                i === index
                                  ? "block h-1.5 w-6 rounded-full bg-emerald-400 transition-[width,background-color] duration-300"
                                  : "block h-1.5 w-1.5 rounded-full bg-white/30 transition-[width,background-color] duration-300 group-hover/dot:bg-white/60"
                              }
                            />
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={previous}
                          aria-label="Previous featured title"
                          title="Previous"
                          className="grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-black/30 text-white/65 backdrop-blur transition hover:border-white/25 hover:bg-white/10 hover:text-white"
                        >
                          <CaretLeft className="h-4 w-4" weight="bold" />
                        </button>
                        <button
                          type="button"
                          onClick={next}
                          aria-label="Next featured title"
                          title="Next"
                          className="grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-black/30 text-white/65 backdrop-blur transition hover:border-white/25 hover:bg-white/10 hover:text-white"
                        >
                          <CaretRight className="h-4 w-4" weight="bold" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  key={`${active.id}-poster`}
                  initial={{ opacity: 0, x: 24, rotate: 1.5 }}
                  animate={{ opacity: 1, x: 0, rotate: 0 }}
                  transition={{ duration: 0.72, ease: [0.32, 0.72, 0, 1] }}
                  className="hidden justify-end md:flex"
                >
                  <div className="relative w-[min(28vw,17rem)] lg:w-[min(25vw,20rem)]">
                    <div
                      className="pointer-events-none absolute inset-x-[12%] bottom-0 h-2/5 bg-black/80 blur-3xl"
                      aria-hidden
                    />
                    <div className="relative aspect-[2/3] overflow-hidden rounded-[1.5rem] bg-black shadow-[0_32px_90px_rgba(0,0,0,0.78)] ring-1 ring-white/12">
                      <CatalogImage
                        src={active.posterSrc ?? active.heroFallback ?? active.heroSrc}
                        fallback={active.heroSrc || active.heroFallback}
                        alt={active.title}
                        fill
                        // No `priority`: this poster is hidden on phones, and the backdrop is the LCP image.
                        sizes="(max-width: 1024px) 28vw, 20rem"
                        className="object-cover"
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/5"
                        aria-hidden
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
