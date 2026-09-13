import { z } from "zod";

const slideSchema = z.object({
  id: z.string().min(1).max(64),
  eyebrow: z.string().max(120).optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url(),
  ctaLabel: z.string().max(80).optional(),
  ctaHref: z.string().max(500).optional(),
  enabled: z.boolean(),
});

export const homepageSettingsSchema = z.object({
  slides: z.array(slideSchema).max(5),
  sectionTitles: z.object({
    trendingMovies: z.string().min(1).max(80),
    popularSeries: z.string().min(1).max(80),
    recentlyAdded: z.string().min(1).max(80),
    awardWinning: z.string().min(1).max(80),
  }),
});

export type HomepageSettingsInput = z.infer<typeof homepageSettingsSchema>;
