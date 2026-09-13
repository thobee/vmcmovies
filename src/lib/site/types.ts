export interface HeroSlide {
  id: string;
  /** Small line above the title, e.g. "New this week" */
  eyebrow?: string;
  title: string;
  description?: string;
  imageUrl: string;
  ctaLabel?: string;
  ctaHref?: string;
  enabled: boolean;
}

export interface HomepageSectionTitles {
  trendingMovies: string;
  popularSeries: string;
  recentlyAdded: string;
  awardWinning: string;
}

export interface HomepageSettings {
  slides: HeroSlide[];
  sectionTitles: HomepageSectionTitles;
  updatedAt?: string;
}

export const DEFAULT_SECTION_TITLES: HomepageSectionTitles = {
  trendingMovies: "Trending Movies",
  popularSeries: "Popular TV Shows",
  recentlyAdded: "Recently Added",
  awardWinning: "Top Rated Films",
};

export const DEFAULT_HOMEPAGE_SETTINGS: HomepageSettings = {
  slides: [],
  sectionTitles: DEFAULT_SECTION_TITLES,
};

export const MAX_HERO_SLIDES = 5;
