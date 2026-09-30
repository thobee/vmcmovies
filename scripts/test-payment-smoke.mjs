/**
 * ponytail: smoke-test Paystack checkout env without touching app code.
 * Usage: npm run payment:smoke
 */
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";

function loadEnvLocal() {
  const raw = readFileSync(".env.local", "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const key = t.slice(0, i).trim();
    const val = t.slice(i + 1).trim().replace(/^"|"$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

function fail(msg) {
  console.error("FAIL:", msg);
  process.exit(1);
}

function normalizePublicUrl(raw) {
  const trimmed = raw.trim().replace(/\/$/, "");
  if (!trimmed) return trimmed;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

async function main() {
  loadEnvLocal();

  const checks = [];
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();
  checks.push({
    ok: Boolean(key),
    label: "PAYSTACK_SECRET_KEY set",
    detail: key ? `${key.slice(0, 10)}...` : undefined,
  });

  const returnBase = normalizePublicUrl(
    process.env.PAYSTACK_RETURN_BASE_URL?.trim() ||
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      "",
  );
  const returnOk =
    Boolean(returnBase) &&
    !returnBase.includes("localhost") &&
    !returnBase.includes("127.0.0.1");
  checks.push({
    ok: returnOk,
    label: "Payment callback base is public",
    detail: returnBase || "(not set)",
  });

  if (!key || !returnOk) {
    console.log("\n--- Config checks ---");
    for (const c of checks) console.log(c.ok ? "OK" : "NO", c.label, c.detail ? `- ${c.detail}` : "");
    fail("Set PAYSTACK_SECRET_KEY and PAYSTACK_RETURN_BASE_URL before testing checkout.");
  }

  const reference = `vmc_probe_${randomBytes(8).toString("hex")}`;
  const callbackUrl = `${returnBase}/payment/callback?reference=${encodeURIComponent(reference)}`;
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "smoke-test@vmcmovies.xyz",
      amount: "70000",
      currency: "NGN",
      reference,
      callback_url: callbackUrl,
      metadata: {
        user_id: "smoke-test",
        plan_id: "monthly",
        plan_name: "1 Month",
        currency: "NGN",
        pricing_kind: "launch",
        cancel_action: `${returnBase}/get-access?cancelled=1`,
      },
    }),
  });

  const json = await res.json().catch(() => ({}));
  checks.push({
    ok: Boolean(res.ok && json?.status && json?.data?.authorization_url),
    label: "Paystack transaction initialized",
    detail: json?.message,
  });

  console.log("\n--- Config checks ---");
  for (const c of checks) console.log(c.ok ? "OK" : "NO", c.label, c.detail ? `- ${c.detail}` : "");

  if (!res.ok || !json?.status) {
    fail(json?.message || `Paystack request failed (${res.status})`);
  }

  console.log("\n--- Paystack checkout probe ---");
  console.log("Reference:", reference);
  console.log("Callback URL:", callbackUrl);
  console.log("Checkout URL:", json.data.authorization_url);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
