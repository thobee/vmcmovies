export const QUALITY_OPTIONS = ["480p", "720p", "1080p", "4K"] as const;

export type Quality = (typeof QUALITY_OPTIONS)[number];

const RANK: Record<Quality, number> = {
  "480p": 0,
  "720p": 1,
  "1080p": 2,
  "4K": 3,
};

export function isQuality(value: string): value is Quality {
  return (QUALITY_OPTIONS as readonly string[]).includes(value);
}

/** Parse CSV / form input like "720p, 1080p, 4k". */
export function parseQualities(value: string | string[] | undefined): Quality[] {
  const parts = Array.isArray(value)
    ? value
    : (value ?? "")
        .split(/[|,]/)
        .map((s) => s.trim())
        .filter(Boolean);

  const seen = new Set<Quality>();
  for (const raw of parts) {
    const key = raw.toUpperCase() === "4K" || raw.toUpperCase() === "2160P" ? "4K" : raw.toLowerCase();
    const normalized = key === "4K" ? "4K" : key;
    if (isQuality(normalized) && !seen.has(normalized)) seen.add(normalized);
  }
  return [...seen].sort((a, b) => RANK[a] - RANK[b]);
}

export function highestQuality(qualities: Quality[] | undefined): Quality | undefined {
  if (!qualities?.length) return undefined;
  return qualities.reduce((best, q) => (RANK[q] > RANK[best] ? q : best));
}
