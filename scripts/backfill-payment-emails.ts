/**
 * Send admin/receipt emails for successful payments that never got notificationSentAt.
 * Usage: npm run email:backfill
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

async function main() {
  loadEnvFile();

  const { ensurePaymentNotificationEmails } = await import(
    "../src/lib/email/payment-notifications"
  );
  const { listPayments } = await import("../src/lib/payments/records");

  const payments = await listPayments(500);
  let queued = 0;

  for (const payment of payments) {
    if (
      payment.status === "success" &&
      payment.premiumActivated &&
      (!payment.notificationSentAt || !payment.adminNotifiedAt)
    ) {
      queued += 1;
      console.log("backfill:", payment.reference);
      await ensurePaymentNotificationEmails(payment.reference);
    }
  }

  console.log(`Done. Processed ${queued} payment(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
