import { isPlanId } from "./plans";

export function getPlanDestination(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (value === "/get-access") return value;
  const match = /^\/get-access\?plan=([a-z]+)$/.exec(value);
  return match && isPlanId(match[1]) ? value : undefined;
}
