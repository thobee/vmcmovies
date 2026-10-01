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

export const revalidate = 120;

export default async function HomePage() {
  const [featured, movies, series, homepage] = await Promise.all([
    getFeaturedContent(),
    getMovies(),
    getSeriesList(),
    getHomepageSettings(),
  ]);

  const titles = homepage.sectionTitles;

  const trendingMovies = movies.slice(0, HOMEPAGE_RAIL_LIMIT);
  const popularSeries = series.slice(0, HOMEPAGE_RAIL_LIMIT);
  const recentlyAdded = sortByNewest([...movies, ...series]).slice(0, HOMEPAGE_RAIL_LIMIT);
  const topRated = sortByRating(movies).slice(0, HOMEPAGE_RAIL_LIMIT);
  const catalog = [...movies, ...series];
  const heroFallback = featured ?? catalog[0] ?? null;

  return (
    <SitePage className="overflow-x-hidden">
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
      <PremiumBanner />
      <WhyVmcSection />
      <Footer />
    </SitePage>
  );
}
