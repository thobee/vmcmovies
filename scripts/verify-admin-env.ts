/**
 * ponytail: one-off check — prints whether ADMIN_* env loads and hash format is valid.
 * Usage: npx tsx scripts/verify-admin-env.ts [password]
 */
import { readFileSync } from "fs";
import { verifyPassword } from "../src/lib/auth/password";

function loadEnvLocal(): Record<string, string> {
  const raw = readFileSync(".env.local", "utf8");
  const out: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const env = loadEnvLocal();
const email = env.ADMIN_EMAIL;
const hash = env.ADMIN_PASSWORD_HASH;
const password = process.argv[2] ?? process.env.ADMIN_TEST_PW;

console.log("ADMIN_EMAIL set:", Boolean(email));
console.log("ADMIN_PASSWORD_HASH set:", Boolean(hash));
console.log("hash length:", hash?.length ?? 0);
console.log("valid bcrypt prefix:", /^\$2[aby]\$/.test(hash ?? ""));

if (password && hash) {
  verifyPassword(password, hash).then((ok) => {
    console.log("password matches hash:", ok);
  });
}
