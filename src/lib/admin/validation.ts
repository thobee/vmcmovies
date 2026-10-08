import { z } from "zod";
import { QUALITY_OPTIONS } from "@/lib/catalog/quality";
import { isValidSlug } from "@/lib/slug";

const telegramLink = z.string().trim().url().refine((value) => {
  const url = new URL(value);
  return url.protocol === "https:" && ["t.me", "telegram.me"].includes(url.hostname) && !url.username && !url.password;
}, "Use an HTTPS Telegram link (https://t.me/...)");
const episodeSchema = z.object({
  episodeNumber: z.coerce.number().int().min(1),
  title: z.string().trim().max(200).optional(),
  downloadUrl: telegramLink,
});
const seasonSchema = z.object({
  seasonNumber: z.coerce.number().int().min(1),
  downloadUrl: z.string().url("Paste a valid season link").or(z.literal("")).default(""),
  zipUrl: telegramLink.or(z.literal("")).optional(),
  episodes: z.array(episodeSchema).max(500).optional(),
}).refine(s => Boolean(s.downloadUrl || s.zipUrl || s.episodes?.length), "Add a season link, ZIP link, or at least one episode")
  .refine(s => new Set(s.episodes?.map(e => e.episodeNumber)).size === (s.episodes?.length ?? 0), "Episode numbers must be unique within a season");

const baseContentSchema = z.object({
  id: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/, "ID can only contain letters, numbers, _ and -"),
  slug: z
    .string()
    .min(2)
    .max(80)
    .refine(isValidSlug, "Slug must be lowercase letters, numbers, and hyphens only"),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  posterImageUrl: z.string().url(),
  backdropImageUrl: z.string().url().optional().or(z.literal("")),
  genres: z.array(z.string().min(1)).min(1),
  year: z.string().optional(),
  rating: z.string().optional(),
  runtime: z.string().optional(),
  qualities: z.array(z.enum(QUALITY_OPTIONS)).optional(),
  featured: z.boolean().optional(),
  accessTier: z.enum(["free", "premium"]).optional(),
  freeUntil: z.string().datetime().optional().or(z.literal("")),
  additionalFiles: z.array(z.object({
    label: z.string().trim().min(1).max(120),
    downloadUrl: telegramLink,
    quality: z.string().trim().max(30).optional(),
    fileSize: z.string().trim().max(30).optional(),
  })).max(30).optional(),
});

export const movieInputSchema = baseContentSchema.extend({
  type: z.literal("movie"),
  downloadUrl: z.string().url().optional(),
});

export const seriesInputSchema = baseContentSchema.extend({
  type: z.literal("series"),
  seriesStatus: z.enum(["ongoing", "completed"]).optional(),
  seasons: z.array(seasonSchema).min(1, "Add at least one season").max(100)
    .refine(s => new Set(s.map(x => x.seasonNumber)).size === s.length, "Season numbers must be unique"),
});

export const contentInputSchema = z.discriminatedUnion("type", [
  movieInputSchema,
  seriesInputSchema,
]);

export type MovieInput = z.infer<typeof movieInputSchema>;
export type SeriesInput = z.infer<typeof seriesInputSchema>;
export type ContentInput = z.infer<typeof contentInputSchema>;
