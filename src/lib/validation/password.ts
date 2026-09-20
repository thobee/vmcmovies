import { z } from "zod";

/** Enforced on signup, password reset, and admin bootstrap signup. */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 12;

export const PASSWORD_HINT = `Use ${PASSWORD_MIN_LENGTH}–${PASSWORD_MAX_LENGTH} characters`;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`);

export function passwordFieldHint(value: string): string | null {
  if (!value) return PASSWORD_HINT;
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `At least ${PASSWORD_MIN_LENGTH} characters (${value.length}/${PASSWORD_MIN_LENGTH})`;
  }
  if (value.length > PASSWORD_MAX_LENGTH) {
    return `At most ${PASSWORD_MAX_LENGTH} characters (${value.length}/${PASSWORD_MAX_LENGTH})`;
  }
  return null;
}
