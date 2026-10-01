/**
 * Promote an existing site user to an admin role.
 * Usage: npm run admin:promote -- someone@example.com content
 *        npm run admin:promote -- owner@example.com admin
 *
 * Run on your machine (or deploy shell) with MONGODB_URI pointing at your database.
 * Not available in the admin panel — only trusted operators should run this.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env.local");
  try {
    const text = readFileSync(envPath, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    console.warn("Warning: could not read .env.local — set MONGODB_URI in the environment.");
  }
}

loadEnvFile();

async function main() {
  const email = process.argv[2]?.trim();
  const roleArg = process.argv[3]?.trim().toLowerCase() ?? "admin";
  const role =
    roleArg === "content" || roleArg === "content_admin"
      ? "content_admin"
      : roleArg === "admin" || roleArg === "full"
        ? "admin"
        : null;

  if (!email || !email.includes("@")) {
    console.error("Usage: npm run admin:promote -- <email> [admin|content]");
    console.error("Example: npm run admin:promote -- editor@vmcmovies.xyz content");
    process.exit(1);
  }

  if (!role) {
    console.error("Role must be either 'admin' or 'content'.");
    process.exit(1);
  }

  const { promoteUserToAdminRole } = await import("../src/lib/auth/users");
  const result = await promoteUserToAdminRole(email, role);

  if (result.status === "not_found") {
    console.error(`No user found for ${email}.`);
    console.error("They must sign up at /signup first, then run this command again.");
    process.exit(1);
  }

  if (result.status === "already_role" || result.status === "already_admin") {
    console.log(`${email} already has the ${role} role.`);
    process.exit(0);
  }

  const { user } = result;
  const label = role === "admin" ? "full admin" : "content admin";
  console.log(`\nPromoted to ${label}: ${user.email} (id: ${user._id})\n`);
  console.log("Next steps for them:");
  console.log("  1. Open /admin/login (not /login)");
  if (!user.passwordHash) {
    console.log("  2. This account has no password — use Forgot password on /admin/forgot or set a password first.");
  } else {
    console.log("  2. Sign in with their site email + password");
  }
  console.log("  3. Complete authenticator (TOTP) enrollment on first login");
  console.log("  4. Save the recovery codes shown once\n");
  if (role === "content_admin") {
    console.log("Content admins can manage movies, series, homepage, updates, requests, and support.");
    console.log("They cannot access users, billing, payments, revenue, or finance settings.\n");
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
