"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Info } from "lucide-react";
import type { Content } from "@/lib/catalog/types";
import type { HeroSlide } from "@/lib/site/types";
import { contentDetailPath } from "@/lib/catalog/paths";
import QualityBadges from "@/components/media/QualityBadges";

type Featured = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  imageUrl: string;
  posterUrl: string;
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
    imageUrl: item.backdropImageUrl ?? item.posterImageUrl,
    posterUrl: item.posterImageUrl,
    ctaLabel: "View details",
    ctaHref: contentDetailPath(item),
    year: item.year,
    rating: item.rating,
    qualities: item.qualities,
    type: item.type,
  };
}

function fromSlide(slide: HeroSlide): Featured {
  return {
    id: slide.id,
    eyebrow: slide.eyebrow?.trim() || "Now featured",
    title: slide.title,
    description: slide.description?.trim() || "",
    imageUrl: slide.imageUrl,
    posterUrl: slide.imageUrl,
    ctaLabel: slide.ctaLabel?.trim() || "View details",
    ctaHref: slide.ctaHref?.trim() || "/get-access",
  };
}

export default function FeaturedStrip({
  slides,
  fallback,
  posters,
}: {
  slides: HeroSlide[];
  fallback: Content;
  posters: Content[];
}) {
  const items = (
    slides.filter((s) => s.enabled && s.imageUrl.trim() && s.title.trim()).length > 0
      ? slides.filter((s) => s.enabled && s.imageUrl.trim() && s.title.trim()).map(fromSlide)
      : [fromContent(fallback)]
  );

  const [index, setIndex] = useState(0);
  const active = items[index] ?? items[0];
  const row = posters.filter((p) => p.id !== fallback.id && p.title !== active?.title).slice(0, 3);

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
    <section className="relative px-4 pt-[92px] sm:px-6 lg:px-10">
      <div className="home-hero-glow pointer-events-none absolute inset-x-0 top-0 h-72" aria-hidden />

      <div className="relative mx-auto max-w-screen-2xl overflow-hidden rounded-[28px] border border-white/[0.08] bg-black shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="relative min-h-[300px] sm:min-h-[320px] lg:min-h-[360px]">
          {items.map((item, i) => (
            <div
              key={item.id}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === index ? 1 : 0 }}
            >
              <Image
                src={item.imageUrl}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover object-center scale-[1.04]"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(34,197,94,0.16),transparent_50%)]" />

          <div className="relative z-10 flex min-h-[300px] items-end gap-5 p-5 sm:min-h-[320px] sm:p-7 lg:min-h-[360px] lg:p-8">
            <Link
              href={active.ctaHref}
              className="hidden w-[148px] shrink-0 overflow-hidden rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.55)] ring-1 ring-white/15 transition hover:ring-emerald-400/50 sm:block lg:w-[168px]"
            >
              <span className="relative block aspect-[2/3]">
                <Image
                  src={active.posterUrl}
                  alt={active.title}
                  fill
                  sizes="168px"
                  className="object-cover"
                />
              </span>
            </Link>

            <div className="min-w-0 flex-1 pb-0.5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-400">
                {active.eyebrow}
              </p>
              <h1
                className="mb-3 max-w-xl text-[1.85rem] font-bold leading-[1.05] text-white sm:text-[2.25rem] lg:text-[2.5rem]"
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
                <p className="mb-5 max-w-lg line-clamp-2 text-sm leading-relaxed text-white/50">
                  {active.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2.5">
                <Link href={active.ctaHref} className="auth-btn gap-2 px-5 py-2.5 text-sm">
                  <Info className="h-3.5 w-3.5" />
                  {active.ctaLabel}
                </Link>
                <Link
                  href="/get-access"
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <Download className="h-3.5 w-3.5" />
                  Get premium
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
            </div>

            {row.length > 0 && (
              <div className="hidden shrink-0 items-end gap-3 self-center xl:flex">
                {row.map((item) => (
                  <PosterTile key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {row.length > 0 && (
        <div className="relative mx-auto mt-4 flex max-w-screen-2xl gap-3 overflow-x-auto hide-scroll pb-1 xl:hidden">
          {row.map((item) => (
            <PosterTile key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

function PosterTile({ item }: { item: Content }) {
  return (
    <Link href={contentDetailPath(item)} className="group w-[128px] shrink-0 sm:w-[140px]">
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-1 group-hover:ring-emerald-400/45">
        <Image
          src={item.posterImageUrl}
          alt={item.title}
          fill
          sizes="128px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-2.5 pb-2.5 pt-10">
          <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-white">{item.title}</p>
        </div>
      </div>
    </Link>
  );
}
