/**
 * Reset authenticator setup for an admin-role account.
 * Usage: npx tsx scripts/reset-admin-mfa.ts -- admin@example.com
 *
 * The next /admin/login will ask the admin to scan a fresh QR code.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ObjectId } from "mongodb";

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env.local");
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^"|"$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  loadEnvFile();

  const args = process.argv.slice(2).filter((a) => a !== "--");
  const email = args[0]?.toLowerCase().trim();
  if (!email || !email.includes("@")) {
    console.error("Usage: npx tsx scripts/reset-admin-mfa.ts -- <email>");
    process.exit(1);
  }

  const { getDb } = await import("../src/lib/db/mongodb");
  const db = await getDb();
  const col = db.collection("users");
  const user = await col.findOne<{ _id: ObjectId; email: string; role?: string }>({
    email,
    role: { $in: ["admin", "content_admin"] },
  });

  if (!user) {
    console.error(`No admin-role user found for ${email}.`);
    process.exit(1);
  }

  await col.updateOne(
    { _id: user._id },
    {
      $set: { totpEnabled: false },
      $unset: { totpSecretEnc: "", totpRecoveryHashes: "" },
    },
  );

  console.log(`Authenticator reset for ${user.email}.`);
  console.log("Next login: use /admin/login, enter email/password, then scan the new QR code.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
