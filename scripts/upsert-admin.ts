/**
 * Create or update a Mongo admin (operator tool — not the public signup route).
 * Usage: npx tsx scripts/upsert-admin.ts -- email@example.com thePassword
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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
  const password = args[1];
  if (!email || !password || !email.includes("@")) {
    console.error("Usage: npx tsx scripts/upsert-admin.ts -- <email> <password>");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters");
    process.exit(1);
  }

  const { hashPassword } = await import("../src/lib/auth/password");
  const { getDb } = await import("../src/lib/db/mongodb");

  const passwordHash = await hashPassword(password);
  const now = new Date();
  const telegramUsername = email.split("@")[0] || "admin";

  const col = (await getDb()).collection("users");
  const result = await col.updateOne(
    { email },
    {
      $set: {
        email,
        passwordHash,
        telegramUsername,
        role: "admin",
      },
      $setOnInsert: {
        premiumStatus: "none",
        premiumStartDate: null,
        premiumExpiryDate: null,
        createdAt: now,
      },
    },
    { upsert: true }
  );

  const action = result.upsertedCount ? "created" : "updated";
  console.log(`Admin ${action}: ${email}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
