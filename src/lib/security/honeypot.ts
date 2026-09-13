/** Hidden field bots fill. Humans leave it empty. */
export function honeypotTripped(body: { website?: unknown }): boolean {
  return typeof body.website === "string" && body.website.trim().length > 0;
}
