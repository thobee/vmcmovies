import { z } from "zod";

export const siteUpdateSchema = z.object({
  kind: z.enum(["news", "movie", "series", "general"]),
  title: z.string().trim().min(2, "Title is required").max(120),
  body: z.string().trim().min(2, "Message is required").max(500),
  href: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  published: z.boolean().default(true),
});

export type SiteUpdateInput = z.infer<typeof siteUpdateSchema>;
