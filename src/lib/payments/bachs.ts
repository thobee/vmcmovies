import crypto from "crypto";
import { displayToDecimal } from "@/lib/payments/amount";
import type { PaymentCurrency } from "@/lib/payments/currency";

const PRODUCTION_BASE = "https://api.bachs.io";
const SANDBOX_BASE = "https://sandbox-api.bachs.io";

export function getBachsSecret(): string {
  const key = process.env.BACHS_API_KEY;
  if (!key) throw new Error("BACHS_API_KEY is not configured");
  return key;
}

export function getBachsWebhookSecret(): string {
  const secret = process.env.BACHS_WEBHOOK_SECRET;
  if (!secret) throw new Error("BACHS_WEBHOOK_SECRET is not configured");
  return secret;
}

function getBachsBase(): string {
  const key = getBachsSecret();
  return key.includes("_sandbox_") ? SANDBOX_BASE : PRODUCTION_BASE;
}

type BachsError = { detail?: string; error_code?: string };

async function bachsRequest<T>(
  path: string,
  init?: RequestInit & { idempotencyKey?: string }
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${getBachsSecret()}`);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (init?.idempotencyKey) {
    headers.set("Idempotency-Key", init.idempotencyKey);
  }

  const res = await fetch(`${getBachsBase()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as T & BachsError;
  if (!res.ok) {
    const detail = [json.detail, json.error_code].filter(Boolean).join(" · ");
    throw new Error(detail || `Bachs request failed (${res.status})`);
  }
  return json;
}

export interface BachsCheckoutSession {
  checkout_id: string;
  checkout_url: string;
  status: string;
  payment_status?: string | null;
  amount?: string;
  currency?: string;
  reference?: string | null;
  metadata?: Record<string, string>;
  charge?: {
    status?: string;
    amount?: string;
    currency?: string;
    paid_at?: string | null;
  } | null;
  created_at?: string;
  completed_at?: string | null;
}

export interface BachsVerifyData {
  reference: string;
  amount: string;
  currency: string;
  status: string;
  paid_at: string | null;
  metadata?: Record<string, string>;
}

export const BACHS_SUCCESS_STATUSES = new Set([
  "succeeded",
  "accepted",
  "overpaid",
  "completed",
  "paid",
]);

export function isBachsPaid(status: string): boolean {
  return BACHS_SUCCESS_STATUSES.has(status.toLowerCase());
}

export function toVerifyData(input: {
  reference: string;
  amount: string;
  currency: string;
  status: string;
  paid_at?: string | null;
  metadata?: Record<string, string>;
}): BachsVerifyData {
  return {
    reference: input.reference,
    amount: input.amount,
    currency: input.currency.toUpperCase(),
    status: input.status.toLowerCase(),
    paid_at: input.paid_at ?? null,
    metadata: input.metadata,
  };
}

export function checkoutSessionToVerifyData(session: BachsCheckoutSession): BachsVerifyData | null {
  const reference = session.reference;
  if (!reference) return null;

  const status =
    session.payment_status ??
    session.charge?.status ??
    session.status ??
    "";
  const amount = session.charge?.amount ?? session.amount;
  const currency = session.charge?.currency ?? session.currency;
  if (!amount || !currency) return null;

  return toVerifyData({
    reference,
    amount,
    currency,
    status,
    paid_at: session.completed_at ?? session.charge?.paid_at ?? null,
    metadata: session.metadata,
  });
}

export async function createCheckoutSession(input: {
  email: string;
  name?: string;
  amountDisplay: number;
  currency: PaymentCurrency;
  reference: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}): Promise<BachsCheckoutSession> {
  // Omit payment_method_options — Bachs offers every corridor enabled on the account.
  // Restricting here causes 400/403 when a corridor (e.g. NGN_CARD) is not enabled yet.
  return bachsRequest<BachsCheckoutSession>("/v1/checkout-sessions", {
    method: "POST",
    body: JSON.stringify({
      pricing: {
        currency: input.currency,
        amount: displayToDecimal(input.amountDisplay),
      },
      billing_currency: input.currency,
      customer: {
        email: input.email,
        ...(input.name ? { name: input.name } : {}),
      },
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      reference: input.reference,
      metadata: input.metadata,
    }),
  });
}

export async function getCheckoutSession(checkoutId: string): Promise<BachsCheckoutSession | null> {
  try {
    return await bachsRequest<BachsCheckoutSession>(
      `/v1/checkout-sessions/${encodeURIComponent(checkoutId)}`
    );
  } catch (err) {
    console.warn("[bachs/checkout]", err);
    return null;
  }
}

export function verifyWebhookSignature(
  rawBody: string,
  timestamp: string | null,
  signature: string | null,
  toleranceSeconds = 300
): boolean {
  if (!timestamp || !signature) return false;

  const ts = parseInt(timestamp, 10);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(Date.now() / 1000 - ts) > toleranceSeconds) return false;

  const message = `${timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac("sha256", getBachsWebhookSecret())
    .update(message, "utf8")
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export type BachsBalance = {
  currency: string;
  available_balance: string;
  pending_balance: string;
};

export async function getBalances(): Promise<BachsBalance[]> {
  const json = await bachsRequest<{ balances?: BachsBalance[] }>("/v1/balances");
  return json.balances ?? [];
}

export type BachsBank = { name: string; code: string };

export async function listBanks(currency: PaymentCurrency): Promise<BachsBank[]> {
  const country = currency === "GHS" ? "GH" : "NG";
  const json = await bachsRequest<{ banks?: BachsBank[] }>(
    `/v1/reference/banks?country=${encodeURIComponent(country)}`
  );
  const banks = json.banks ?? [];
  const byCode = new Map<string, BachsBank>();
  for (const bank of banks) {
    if (!byCode.has(bank.code)) byCode.set(bank.code, bank);
  }
  return [...byCode.values()];
}

export async function resolveBankAccount(input: {
  accountNumber: string;
  bankCode: string;
  currency: PaymentCurrency;
}): Promise<{ accountNumber: string; accountName: string }> {
  const country = input.currency === "GHS" ? "GH" : "NG";
  const json = await bachsRequest<{
    resolved?: boolean;
    account_name?: string | null;
    account_number?: string | null;
    message?: string | null;
  }>("/v1/misc/bank-accounts/resolve", {
    method: "POST",
    body: JSON.stringify({
      account_number: input.accountNumber,
      bank_code: input.bankCode,
      country,
    }),
  });

  if (!json.resolved || !json.account_name) {
    throw new Error(json.message ?? "Could not resolve account");
  }

  return {
    accountNumber: json.account_number ?? input.accountNumber,
    accountName: json.account_name,
  };
}

export type BachsPayoutDestination = {
  id: string;
  name: string;
  currency: string;
  status: string;
  is_usable: boolean;
  account_name?: string | null;
};

export async function createPayoutDestination(input: {
  name: string;
  currency: PaymentCurrency;
  accountNumber: string;
  bankCode: string;
}): Promise<BachsPayoutDestination> {
  return bachsRequest<BachsPayoutDestination>("/v1/payouts/destinations", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      currency: input.currency,
      account_number: input.accountNumber,
      bank_code: input.bankCode,
    }),
  });
}

export type BachsPayoutResult = {
  id: string;
  status: string;
  amount: string;
  currency: string;
  reference?: string | null;
  failure_reason?: string | null;
};

export async function createPayout(input: {
  destinationId: string;
  amountDecimal: string;
  reference: string;
}): Promise<BachsPayoutResult> {
  return bachsRequest<BachsPayoutResult>("/v1/payouts", {
    method: "POST",
    idempotencyKey: input.reference,
    body: JSON.stringify({
      destination: input.destinationId,
      amount: input.amountDecimal,
      reference: input.reference,
    }),
  });
}

export function explainBachsPayoutError(message: unknown): string {
  const raw = typeof message === "string" && message.trim() ? message.trim() : "Payout failed";
  const lower = raw.toLowerCase();

  if (lower.includes("not approved") || lower.includes("pending_review") || lower.includes("not usable")) {
    return (
      "This payout destination is not approved yet. Open the Bachs dashboard → Payouts, approve the destination, then retry."
    );
  }

  if (lower.includes("insufficient") || lower.includes("not enough")) {
    return "Bachs balance is too low for this withdrawal (including fees).";
  }

  return raw;
}
