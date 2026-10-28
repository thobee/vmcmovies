/**
 * Smoke-test Bachs checkout configuration without writing an app payment record.
 * Usage: npm run payment:smoke
 */
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";

function loadEnvLocal() {
  const raw = readFileSync(".env.local", "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const value = line.trim();
    if (!value || value.startsWith("#")) continue;
    const separator = value.indexOf("=");
    if (separator < 0) continue;
    const key = value.slice(0, separator).trim();
    const envValue = value.slice(separator + 1).trim().replace(/^"|"$/g, "");
    if (!process.env[key]) process.env[key] = envValue;
  }
}

function fail(message) {
  console.error("FAIL:", message);
  process.exit(1);
}

function normalizePublicUrl(raw) {
  const trimmed = raw.trim().replace(/\/$/, "");
  if (!trimmed) return trimmed;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

async function main() {
  loadEnvLocal();
  const key = process.env.BACHS_API_KEY?.trim();
  const baseUrl = key?.startsWith("sk_sandbox_")
    ? "https://sandbox-api.bachs.io"
    : key?.startsWith("sk_live_")
      ? "https://api.bachs.io"
      : null;
  const returnBase = normalizePublicUrl(
    process.env.PAYMENT_RETURN_BASE_URL?.trim() ||
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      "",
  );
  const returnOk =
    Boolean(returnBase) &&
    !returnBase.includes("localhost") &&
    !returnBase.includes("127.0.0.1");

  const checks = [
    { ok: Boolean(key && baseUrl), label: "BACHS_API_KEY is valid", detail: key ? `${key.slice(0, 12)}...` : "(not set)" },
    { ok: returnOk, label: "Payment callback base is public", detail: returnBase || "(not set)" },
  ];
  if (!key || !baseUrl || !returnOk) {
    console.log("\n--- Config checks ---");
    for (const check of checks) console.log(check.ok ? "OK" : "NO", check.label, `- ${check.detail}`);
    fail("Set BACHS_API_KEY and PAYMENT_RETURN_BASE_URL before testing checkout.");
  }

  const reference = `vmc_probe_${randomBytes(8).toString("hex")}`;
  const response = await fetch(`${baseUrl}/v1/checkout-sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "Idempotency-Key": reference,
    },
    body: JSON.stringify({
      pricing: { currency: "NGN", amount: "1000.00" },
      customer: { email: "smoke-test@vmcmovies.xyz" },
      success_url: `${returnBase}/payment/callback`,
      cancel_url: `${returnBase}/get-access?cancelled=1`,
      reference,
      metadata: { source: "vmc-payment-smoke" },
    }),
  });
  const data = await response.json().catch(() => ({}));
  const checkoutId = data.checkout_id ?? data.id;
  checks.push({
    ok: Boolean(response.ok && checkoutId && data.checkout_url),
    label: "Bachs checkout initialized",
    detail: data.detail ?? data.message ?? response.status,
  });

  console.log("\n--- Config checks ---");
  for (const check of checks) console.log(check.ok ? "OK" : "NO", check.label, `- ${check.detail}`);
  if (!response.ok || !checkoutId || !data.checkout_url) {
    fail(data.detail || data.message || `Bachs request failed (${response.status})`);
  }

  console.log("\n--- Bachs checkout probe ---");
  console.log("Reference:", reference);
  console.log("Checkout ID:", checkoutId);
  console.log("Checkout URL:", data.checkout_url);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
