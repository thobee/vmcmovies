/**
 * Seed MongoDB catalog from mock data.
 * Usage: npm run seed
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
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

async function main() {
  const { reseedCatalog } = await import("../src/lib/catalog/seed");
  const { dbContentCount } = await import("../src/lib/catalog/db");

  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env.local");
    process.exit(1);
  }

  const before = await dbContentCount();
  const count = await reseedCatalog();
  const after = await dbContentCount();

  console.log(`Catalog seeded: ${count} items (was ${before}, now ${after})`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
