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

  return (
    <SitePage className="overflow-x-hidden">
      <FeaturedStrip
        slides={homepage.slides}
        fallback={featured}
        catalog={[...movies, ...series]}
      />

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
