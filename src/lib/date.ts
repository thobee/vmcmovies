const DAY_MS = 24 * 60 * 60 * 1000;

export function daysUntil(value: string | Date): number {
  const end = value instanceof Date ? value.getTime() : new Date(value).getTime();
  if (Number.isNaN(end)) return 0;
  return Math.max(0, Math.ceil((end - Date.now()) / DAY_MS));
}
