/**
 * ponytail: one-off — verify Resend + ADMIN_NOTIFY_EMAIL from .env.local
 * Usage: npm run email:test
 */
import { readFileSync } from "fs";

function loadEnvLocal(): Record<string, string> {
  const raw = readFileSync(".env.local", "utf8");
  const out: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}

async function main() {
  const env = loadEnvLocal();
  const apiKey = env.RESEND_API_KEY;
  const from = env.EMAIL_FROM || "VMC <onboarding@resend.dev>";
  const to = env.ADMIN_NOTIFY_EMAIL || env.ADMIN_EMAIL;

  if (!apiKey) {
    console.error("RESEND_API_KEY missing in .env.local");
    process.exit(1);
  }
  if (!to) {
    console.error("ADMIN_NOTIFY_EMAIL (or ADMIN_EMAIL) missing in .env.local");
    process.exit(1);
  }

  console.log("From:", from);
  console.log("To:", to);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "VMC Resend test",
      html: "<p>If you received this, Resend is configured correctly.</p>",
    }),
  });

  const body = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", body);

  if (!res.ok) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
