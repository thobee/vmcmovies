/**
 * Inactivity logout for logged-in users (client-side).
 * Absolute JWT expiry is separate — see session.ts (7d / 30d remember).
 */
export const DEFAULT_USER_IDLE_TIMEOUT_MINUTES = 30;

function resolveIdleMinutes(): number {
  const raw = process.env.NEXT_PUBLIC_AUTH_IDLE_TIMEOUT_MINUTES;
  if (!raw) return DEFAULT_USER_IDLE_TIMEOUT_MINUTES;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 5) return DEFAULT_USER_IDLE_TIMEOUT_MINUTES;
  return n;
}

export const USER_IDLE_TIMEOUT_MS = resolveIdleMinutes() * 60 * 1000;

/** Throttle how often we reset the idle timer on burst input events. */
export const IDLE_ACTIVITY_THROTTLE_MS = 5_000;
