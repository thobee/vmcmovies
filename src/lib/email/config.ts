/** Resend + notification addresses from env. */

const RESEND_DEV_FROM = "VMC <onboarding@resend.dev>";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function getEmailFrom(): string {
  const from = process.env.EMAIL_FROM?.trim();
  if (from) return from;
  return RESEND_DEV_FROM;
}

/** Inbox that receives “new payment” alerts — set ADMIN_NOTIFY_EMAIL in .env.local */
export function getAdminNotifyEmail(): string | null {
  const notify = process.env.ADMIN_NOTIFY_EMAIL?.trim();
  if (notify) return notify;
  const admin = process.env.ADMIN_EMAIL?.trim();
  return admin || null;
}

export function getResendApiKey(): string | null {
  const key = process.env.RESEND_API_KEY?.trim();
  return key || null;
}
