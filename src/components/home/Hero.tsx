import Image from "next/image";
import Link from "next/link";
import { Info, Star } from "lucide-react";
import type { Content } from "@/lib/catalog/types";
import { contentDetailPath } from "@/lib/catalog/paths";
import QualityBadges from "@/components/media/QualityBadges";

interface HeroProps {
  item: Content;
}

export default function Hero({ item }: HeroProps) {
  return (
    <section
      className="relative w-full overflow-hidden bg-[var(--bg)]"
      style={{ height: "min(92vh, 820px)", minHeight: 520 }}
    >
      {item.backdropImageUrl && (
        <Image
          src={item.backdropImageUrl}
          alt={item.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      )}

      <div className="absolute inset-0 hero-left" />
      <div className="absolute inset-0 hero-bottom" />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)]/55 via-transparent to-transparent" />

      <div className="relative z-10 h-full max-w-screen-2xl mx-auto px-5 sm:px-8 lg:px-14 flex flex-col justify-end pb-20 sm:pb-24 md:justify-center md:pb-0">
        <div className="max-w-[440px] lg:max-w-[520px]">
          <p className="eyebrow mb-4 fade-up">
            <span className="inline-block w-4 h-px bg-[var(--amber)]" />
            Unlimited Movies &amp; Series
          </p>

          <h1
            className="text-white leading-[0.92] mb-5 fade-up delay-1 drop-shadow-2xl"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.75rem, 7.5vw, 5.25rem)",
              letterSpacing: "-0.02em",
            }}
          >
            {item.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4 fade-up delay-2 text-sm">
            <QualityBadges qualities={item.qualities} hd />
            <span className="px-2 py-1 rounded text-[10px] font-bold bg-[var(--amber)] text-white uppercase leading-none">
              {item.type === "series" ? "Series" : "Movie"}
            </span>
            {item.rating && (
              <span className="flex items-center gap-1 font-semibold text-white/90">
                <Star className="w-3.5 h-3.5" fill="var(--gold)" stroke="var(--gold)" />
                {item.rating}
              </span>
            )}
            {item.year && <span className="text-white/60">{item.year}</span>}
            {item.runtime && <span className="text-white/60">{item.runtime}</span>}
            {item.genres.length > 0 && (
              <span className="text-white/60">{item.genres.slice(0, 3).join(" · ")}</span>
            )}
          </div>

          <p className="text-white/60 text-[15px] leading-[1.7] line-clamp-2 sm:line-clamp-3 mb-8 fade-up delay-3">
            {item.description}
          </p>

          <div className="flex flex-wrap gap-3 fade-up delay-4">
            <Link href={contentDetailPath(item)} className="btn-pill btn-pill-primary">
              <Info className="w-4 h-4" />
              View Details
            </Link>
            <Link href="/get-access" className="btn-pill glass text-white hover:bg-[var(--surface-2)]">
              Get Premium Access
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={
              i === 0
                ? "w-6 h-1.5 rounded-full bg-[var(--amber)]"
                : "w-1.5 h-1.5 rounded-full bg-white/25"
            }
          />
        ))}
      </div>
    </section>
  );
}
