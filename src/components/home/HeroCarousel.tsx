"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Info } from "@phosphor-icons/react";
import type { Content } from "@/lib/catalog/types";
import type { HeroSlide } from "@/lib/site/types";
import { contentDetailPath } from "@/lib/catalog/paths";

export interface HeroCarouselItem {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
}

function slideFromContent(item: Content): HeroCarouselItem {
  return {
    id: item.id,
    eyebrow: "Unlimited Movies & Series",
    title: item.title,
    description: item.description,
    imageUrl: item.backdropImageUrl ?? item.posterImageUrl,
    ctaLabel: "View Details",
    ctaHref: contentDetailPath(item),
  };
}

function slideFromSettings(slide: HeroSlide): HeroCarouselItem {
  return {
    id: slide.id,
    eyebrow: slide.eyebrow?.trim() || "Featured on VMC",
    title: slide.title,
    description: slide.description?.trim() || "",
    imageUrl: slide.imageUrl,
    ctaLabel: slide.ctaLabel?.trim() || "View Details",
    ctaHref: slide.ctaHref?.trim() || "/get-access",
  };
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  fallback: Content;
}

export default function HeroCarousel({ slides, fallback }: HeroCarouselProps) {
  const items = (
    slides.filter((s) => s.enabled && s.imageUrl.trim() && s.title.trim()).length > 0
      ? slides.filter((s) => s.enabled && s.imageUrl.trim() && s.title.trim()).map(slideFromSettings)
      : [slideFromContent(fallback)]
  );

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
    <section
      className="relative w-full overflow-hidden bg-[var(--bg)]"
      style={{ height: "min(92vh, 820px)", minHeight: 520 }}
    >
      {items.map((item, i) => (
        <div
          key={item.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? "auto" : "none" }}
        >
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      ))}

      <div className="absolute inset-0 hero-left" />
      <div className="absolute inset-0 hero-bottom" />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)]/55 via-transparent to-transparent" />

      <div className="relative z-10 h-full max-w-screen-2xl mx-auto px-5 sm:px-8 lg:px-14 flex flex-col justify-end pb-20 sm:pb-24 md:justify-center md:pb-0">
        <div className="max-w-[520px]">
          <p className="text-[var(--amber)] text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase mb-3 flex items-center gap-2">
            <span className="inline-block w-4 h-px bg-[var(--amber)]" />
            {active.eyebrow}
          </p>

          <h1
            className="text-white leading-[0.9] mb-5 drop-shadow-2xl"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.5rem, 7vw, 5rem)",
              letterSpacing: "-0.01em",
            }}
          >
            {active.title}
          </h1>

          {active.description && (
            <p className="text-white/55 text-sm leading-[1.75] line-clamp-3 mb-7 max-w-lg">
              {active.description}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Link
              href={active.ctaHref}
              className="flex items-center gap-2.5 px-7 py-3 rounded-xl bg-[var(--amber)] text-white text-sm font-bold tracking-wide hover:bg-[var(--amber-hover)] active:scale-95 transition-all shadow-xl shadow-[var(--amber)]/30"
            >
              <Info className="w-4 h-4" weight="bold" />
              {active.ctaLabel}
            </Link>
            <Link
              href="/get-access"
              className="flex items-center gap-2.5 px-7 py-3 rounded-xl glass text-white text-sm font-semibold hover:bg-[var(--surface-2)] active:scale-95 transition-all"
            >
              Get Premium Access
            </Link>
          </div>
        </div>
      </div>

      {items.length > 1 && (
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={
                i === index
                  ? "w-6 h-1.5 rounded-full bg-[var(--amber)]"
                  : "w-1.5 h-1.5 rounded-full bg-white/25 hover:bg-white/45"
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
