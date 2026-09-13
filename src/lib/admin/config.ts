export function getAdminEmail(): string {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) {
    throw new Error("ADMIN_EMAIL is not configured");
  }
  return email;
}

export function getAdminPasswordHash(): string {
  const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (!hash) {
    throw new Error(
      "ADMIN_PASSWORD_HASH is not configured. Run: npm run admin:hash-password"
    );
  }
  return hash;
}

export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_EMAIL?.trim() && process.env.ADMIN_PASSWORD_HASH?.trim()
  );
}
