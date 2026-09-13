import { z } from "zod";
import { QUALITY_OPTIONS } from "@/lib/catalog/quality";
import { isValidSlug } from "@/lib/slug";

const seasonSchema = z.object({
  seasonNumber: z.coerce.number().int().min(1),
  downloadUrl: z.string().url("Paste a valid Telegram link (https://t.me/...)"),
});

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
});

export const movieInputSchema = baseContentSchema.extend({
  type: z.literal("movie"),
  downloadUrl: z.string().url().optional(),
});

export const seriesInputSchema = baseContentSchema.extend({
  type: z.literal("series"),
  seasons: z.array(seasonSchema).min(1, "Add at least one season"),
});

export const contentInputSchema = z.discriminatedUnion("type", [
  movieInputSchema,
  seriesInputSchema,
]);

export type MovieInput = z.infer<typeof movieInputSchema>;
export type SeriesInput = z.infer<typeof seriesInputSchema>;
export type ContentInput = z.infer<typeof contentInputSchema>;
