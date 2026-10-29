import { isPlanId } from "./plans";

/** Title pages a visitor can be returned to after sign-up/login (slug format from lib/slug.ts). */
const TITLE_PATH = /^\/(movie|series)\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Allow-list for the post-auth `next` redirect: plan checkout or a title page only,
 * so the parameter can never send someone to another site.
 */
export function getPlanDestination(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (value === "/get-access") return value;
  if (TITLE_PATH.test(value)) return value;
  const match = /^\/get-access\?plan=([a-z]+)$/.exec(value);
  return match && isPlanId(match[1]) ? value : undefined;
}
