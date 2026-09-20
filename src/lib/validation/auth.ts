import { z } from "zod";
import { passwordSchema } from "@/lib/validation/password";

export const telegramUsernameSchema = z
  .string()
  .min(2, "Telegram username is required")
  .max(32, "Telegram username is too long")
  .transform((v) => v.replace(/^@/, "").trim())
  .refine((v) => v.length >= 2, "Telegram username is required")
  .refine(
    (v) => /^[a-zA-Z0-9_]+$/.test(v),
    "Use letters, numbers, and underscores only"
  );

export const signupSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: passwordSchema,
  telegramUsername: telegramUsernameSchema,
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

export const updateTelegramSchema = z.object({
  telegramUsername: telegramUsernameSchema,
});

export const adminSignupSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: passwordSchema,
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
