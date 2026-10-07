import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Sparkle } from "@phosphor-icons/react/dist/ssr";
import {
  getFeaturedContent,
  getMovies,
  getSeriesList,
} from "@/lib/catalog";
import {
  HOMEPAGE_RAIL_LIMIT,
  sortByNewest,
  sortByRating,
} from "@/lib/catalog/homepage";
import { getHomepageSettings } from "@/lib/site";
import SitePage from "@/components/layout/SitePage";
import Footer from "@/components/layout/Footer";
import FeaturedStrip from "@/components/home/FeaturedStrip";
import HowItWorks from "@/components/home/HowItWorks";
import ContentRail from "@/components/home/ContentRail";
import PremiumBanner from "@/components/access/PremiumBanner";
import VmcBrandBanner from "@/components/home/VmcBrandBanner";
import WhyVmcSection from "@/components/home/WhyVmcSection";
import { getBillingConfig } from "@/lib/payments/billing/db";
import { buildResolvedPlans, isWelcomeTrialWindowActive } from "@/lib/payments/billing/resolve";
import { toPublicContent } from "@/lib/catalog/public";
import { getAppUrl } from "@/lib/payments/app-url";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Download Movies & Series on Telegram | VMC",
  description:
    "Browse a clean catalogue of movies and TV series, see Free or Premium access upfront, and receive verified downloads directly through Telegram.",
  keywords: [
    "movie downloads",
    "TV series downloads",
    "Telegram movie downloads",
    "VMC movies",
    "Nigerian movie download service",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "VMC — Movies and Series Delivered on Telegram",
    description:
      "Browse without ads, choose Free or Premium, and receive verified movie and series downloads through Telegram.",
    url: "/",
    siteName: "VMC — Vintage Movie Channel",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "VMC — Movies and Series Delivered on Telegram",
    description: "A clean catalogue with verified downloads delivered through Telegram.",
  },
};

export const revalidate = 120;

export default async function HomePage() {
  const [featured, movies, series, homepage, billing, session] = await Promise.all([
    getFeaturedContent(),
    getMovies(),
    getSeriesList(),
    getHomepageSettings(),
    getBillingConfig(),
    getSession(),
  ]);

  const titles = homepage.sectionTitles;

  const publicMovies = movies.map(toPublicContent);
  const publicSeries = series.map(toPublicContent);
  const trendingMovies = publicMovies.slice(0, HOMEPAGE_RAIL_LIMIT);
  const popularSeries = publicSeries.slice(0, HOMEPAGE_RAIL_LIMIT);
  const recentlyAdded = sortByNewest([...publicMovies, ...publicSeries]).slice(0, HOMEPAGE_RAIL_LIMIT);
  const topRated = sortByRating(publicMovies).slice(0, HOMEPAGE_RAIL_LIMIT);
  const catalog = [...publicMovies, ...publicSeries];
  const heroFallback = featured ?? catalog[0] ?? null;
  const trialActive = isWelcomeTrialWindowActive(billing);
  const appUrl = getAppUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${appUrl}/#organization`,
        name: "VMC — Vintage Movie Channel",
        url: appUrl,
        logo: `${appUrl}/brand/icon-512.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${appUrl}/#website`,
        name: "VMC — Vintage Movie Channel",
        url: appUrl,
        description: "A movie and series catalogue with verified downloads delivered through Telegram.",
        publisher: { "@id": `${appUrl}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${appUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <SitePage className="overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      {heroFallback ? (
        <FeaturedStrip
          slides={homepage.slides}
          fallback={heroFallback}
          catalog={catalog}
        />
      ) : (
        <section className="px-4 pt-[110px] pb-16 sm:px-6 lg:px-10">
          <div className="bezel-outer mx-auto max-w-screen-2xl">
            <div className="bezel-inner border border-white/[0.08] px-6 py-14 text-center sm:px-10 sm:py-20">
              <p className="eyebrow-pill mb-4">VMC</p>
              <h1
                className="text-3xl font-semibold leading-tight text-white sm:text-5xl"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
              >
                Catalog temporarily unavailable
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/60 sm:text-base sm:leading-7">
                We could not load the movie catalog right now. Please check back shortly while we
                reconnect the database.
              </p>
            </div>
          </div>
        </section>
      )}

      {trialActive && (
        <section className="px-4 pt-5 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-screen-2xl">
            <div className="flex w-full flex-col gap-3 rounded-xl border border-emerald-300/12 bg-emerald-400/[0.045] px-4 py-3 sm:w-fit sm:max-w-4xl sm:flex-row sm:items-center sm:gap-5">
              <div className="flex min-w-0 items-start gap-2.5">
                <Sparkle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" weight="fill" />
                <div>
                  <p className="text-[13px] font-bold text-emerald-200">
                    {billing.welcomeTrial.bannerTitle}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-white/52">
                    New members can activate {billing.welcomeTrial.durationDays} days of Premium
                    from their first Premium download. No card required.
                  </p>
                </div>
              </div>
              {!session && (
                <Link
                  href="/signup"
                  className="group inline-flex w-fit shrink-0 items-center gap-1.5 text-xs font-bold text-emerald-300 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-emerald-200"
                >
                  Create account
                  <ArrowRight className="h-3.5 w-3.5 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5" weight="bold" />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="flex flex-col gap-12 pt-10 pb-6 sm:gap-14 sm:pt-12">
        <ContentRail title={titles.trendingMovies} items={trendingMovies} viewAllHref="/movies" />
        <ContentRail title={titles.popularSeries} items={popularSeries} viewAllHref="/series" />
        <ContentRail title={titles.recentlyAdded} items={recentlyAdded} viewAllHref="/movies" />
        {topRated.length >= 4 && (
          <ContentRail title={titles.awardWinning} items={topRated} viewAllHref="/movies" />
        )}
      </div>

      <HowItWorks />
      <VmcBrandBanner />
      <PremiumBanner
        plans={buildResolvedPlans(billing, "NGN")}
        trial={
          trialActive
            ? {
                title: billing.welcomeTrial.bannerTitle,
                body: billing.welcomeTrial.bannerBody,
                days: billing.welcomeTrial.durationDays,
              }
            : null
        }
      />
      <WhyVmcSection />
      <Footer />
    </SitePage>
  );
}
