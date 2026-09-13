function telegramBotUsername(): string {
  const raw = process.env.NEXT_PUBLIC_TELEGRAM_BOT ?? "VmcfileBot";
  return raw.replace(/^@/, "").trim() || "VmcfileBot";
}

/** Build a Telegram bot deep link for a content or episode id */
export function buildTelegramDownloadUrl(payloadId: string): string {
  return `https://t.me/${telegramBotUsername()}?start=${encodeURIComponent(payloadId)}`;
}

/** Payload for a full season — bot lists all episodes for that season. */
export function buildTelegramSeasonPayload(seriesId: string, seasonNumber: number): string {
  return `${seriesId}-s${seasonNumber}`;
}

export function buildTelegramSeasonUrl(seriesId: string, seasonNumber: number): string {
  return buildTelegramDownloadUrl(buildTelegramSeasonPayload(seriesId, seasonNumber));
}

export function getTelegramBotUsername(): string {
  return telegramBotUsername();
}

/** Open the bot (no download payload) — for first-time members to Start the bot. */
export function getTelegramBotUrl(): string {
  return `https://t.me/${telegramBotUsername()}`;
}

export function getTelegramChannelUrl(): string {
  return (
    process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL?.trim() ||
    "https://t.me/+mwgLjKLBwYZkZmY0"
  );
}
