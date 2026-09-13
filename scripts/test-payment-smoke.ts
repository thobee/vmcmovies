/**
 * ponytail: smoke-test launch payment path (Bachs + env + pricing)
 * Usage: npx tsx scripts/test-payment-smoke.ts
 */
import { readFileSync } from "fs";

function loadEnvLocal(): void {
  const raw = readFileSync(".env.local", "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const key = t.slice(0, i).trim();
    const val = t.slice(i + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

function fail(msg: string): never {
  console.error("FAIL:", msg);
  process.exit(1);
}

async function main() {
  loadEnvLocal();

  const checks: { ok: boolean; label: string; detail?: string }[] = [];

  const bachsKey = process.env.BACHS_API_KEY?.trim();
  checks.push({
    ok: Boolean(bachsKey),
    label: "BACHS_API_KEY set",
    detail: bachsKey ? `${bachsKey.slice(0, 12)}…` : undefined,
  });

  const webhook = process.env.BACHS_WEBHOOK_SECRET?.trim();
  checks.push({ ok: Boolean(webhook), label: "BACHS_WEBHOOK_SECRET set" });

  const resend = process.env.RESEND_API_KEY?.trim();
  checks.push({ ok: Boolean(resend), label: "RESEND_API_KEY set" });

  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL?.trim();
  checks.push({ ok: Boolean(adminEmail), label: "ADMIN_NOTIFY_EMAIL set", detail: adminEmail });

  const returnBase = process.env.BACHS_RETURN_BASE_URL?.trim().replace(/\/$/, "") ?? "";
  const returnOk =
    Boolean(returnBase) &&
    !returnBase.includes("localhost") &&
    !returnBase.includes("127.0.0.1") &&
    !returnBase.endsWith("xyzx");
  checks.push({
    ok: returnOk,
    label: "BACHS_RETURN_BASE_URL is a public URL",
    detail: returnBase || "(not set)",
  });

  const { resolveChargeForUser } = await import("../src/lib/payments/billing/resolve");
  const { DEFAULT_BILLING_CONFIG } = await import("../src/lib/payments/billing/defaults");
  const { resolvePlanPrice } = await import("../src/lib/payments/billing/resolve");

  const launch = resolvePlanPrice(DEFAULT_BILLING_CONFIG, "monthly", "NGN", {
    launchEligible: true,
  });
  checks.push({
    ok: launch.display === 700 && launch.pricingKind === "launch",
    label: "Launch price resolves to ₦700",
    detail: `₦${launch.display} (${launch.pricingKind})`,
  });

  const { createCheckoutSession } = await import("../src/lib/payments/bachs");
  const { generatePaymentReference } = await import("../src/lib/payments/reference");

  if (!returnOk) {
    console.log("\n--- Config checks ---");
    for (const c of checks) console.log(c.ok ? "✓" : "✗", c.label, c.detail ? `— ${c.detail}` : "");
    fail(
      "Fix BACHS_RETURN_BASE_URL — must be your deployed public site (localhost is blocked by Bachs).",
    );
  }

  const reference = generatePaymentReference();
  const successUrl = `${returnBase}/payment/callback?reference=${encodeURIComponent(reference)}`;

  try {
    const session = await createCheckoutSession({
      email: "smoke-test@vmcmovies.xyz",
      amountDisplay: launch.display,
      currency: "NGN",
      reference,
      successUrl,
      cancelUrl: `${returnBase}/get-access?cancelled=1`,
      metadata: {
        user_id: "smoke-test",
        plan_id: "monthly",
        plan_name: "1 Month",
        currency: "NGN",
        pricing_kind: "launch",
      },
    });

    checks.push({
      ok: Boolean(session.checkout_url && session.checkout_id),
      label: "Bachs checkout session created",
      detail: session.checkout_id,
    });

    console.log("\n--- Config checks ---");
    for (const c of checks) console.log(c.ok ? "✓" : "✗", c.label, c.detail ? `— ${c.detail}` : "");

    console.log("\n--- Bachs checkout (launch ₦700) ---");
    console.log("Reference:", reference);
    console.log("Success URL:", successUrl);
    console.log("Checkout URL:", session.checkout_url);
    console.log("\nOpen the checkout URL in a browser, pay with Bachs sandbox, then confirm redirect lands on /payment/callback.");
  } catch (err) {
    console.log("\n--- Config checks ---");
    for (const c of checks) console.log(c.ok ? "✓" : "✗", c.label, c.detail ? `— ${c.detail}` : "");
    fail(err instanceof Error ? err.message : String(err));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
