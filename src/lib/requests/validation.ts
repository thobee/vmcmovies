import { z } from "zod";

const currentYear = new Date().getFullYear();

export const titleRequestSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(120),
  type: z.enum(["movie", "series"]),
  year: z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === null || v === "") return null;
      const n = typeof v === "number" ? v : parseInt(String(v).trim(), 10);
      return Number.isFinite(n) ? n : null;
    })
    .refine((v) => v === null || (v >= 1900 && v <= currentYear + 2), {
      message: "Enter a valid year",
    }),
});
