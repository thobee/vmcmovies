import { z } from "zod";

/** Enforced on signup, password reset, and admin bootstrap signup. */
export const PASSWORD_MIN_LENGTH = 8;
/** Long enough for password managers and passphrases. */
export const PASSWORD_MAX_LENGTH = 64;
/** bcrypt ignores everything past 72 bytes, so multi-byte characters must not push past it. */
const PASSWORD_MAX_BYTES = 72;

export const PASSWORD_HINT = `At least ${PASSWORD_MIN_LENGTH} characters`;

const byteLength = (value: string) => new TextEncoder().encode(value).length;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`)
  .refine((value) => byteLength(value) <= PASSWORD_MAX_BYTES, "Password is too long — use fewer emoji or special symbols");

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
