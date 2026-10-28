import crypto from "crypto";
import { minorToDecimal } from "@/lib/payments/amount";
import type { PaymentCurrency } from "@/lib/payments/currency";
import type { PaymentVerifyData } from "@/lib/payments/provider";

type BachsCheckoutSession = {
  id?: string;
  checkout_id?: string;
  checkout_url?: string;
  status?: string;
  payment_status?: string;
  amount?: string | number;
  currency?: string;
  reference?: string;
  completed_at?: string | null;
  created_at?: string | null;
  metadata?: Record<string, unknown> | null;
  charge?: {
    status?: string;
    amount?: string | number;
    amount_paid?: string | number;
    currency?: string;
    completed_at?: string | null;
    created_at?: string | null;
  } | null;
};

export type BachsCheckout = {
  checkoutId: string;
  checkoutUrl: string;
};

export function getBachsApiKey(): string {
  const key = process.env.BACHS_API_KEY?.trim();
  if (!key) throw new Error("BACHS_API_KEY is not configured");
  return key;
}

function getBachsBaseUrl(): string {
  const key = getBachsApiKey();
  if (key.startsWith("sk_sandbox_")) return "https://sandbox-api.bachs.io";
  if (key.startsWith("sk_live_")) return "https://api.bachs.io";
  throw new Error("BACHS_API_KEY must be a Bachs sandbox or live secret key");
}

async function bachsRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${getBachsApiKey()}`);
  headers.set("Accept", "application/json");
  if (init?.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const response = await fetch(`${getBachsBaseUrl()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as T & {
    detail?: string;
    message?: string;
    error_code?: string;
  };

  if (!response.ok) {
    const detail = [data.detail ?? data.message, data.error_code].filter(Boolean).join(" · ");
    throw new Error(detail || `Bachs request failed (${response.status})`);
  }
  return data;
}

function normalizeMetadata(metadata: BachsCheckoutSession["metadata"]): Record<string, string> | undefined {
  if (!metadata) return undefined;
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (["string", "number", "boolean"].includes(typeof value)) normalized[key] = String(value);
  }
  return Object.keys(normalized).length ? normalized : undefined;
}

export function toVerifyData(session: BachsCheckoutSession): PaymentVerifyData {
  const amount = session.charge?.amount_paid ?? session.charge?.amount ?? session.amount ?? "0";
  return {
    reference: session.reference ?? "",
    amount: String(amount),
    currency: (session.charge?.currency ?? session.currency ?? "").toUpperCase(),
    status: (session.charge?.status ?? session.payment_status ?? session.status ?? "pending").toLowerCase(),
    paid_at:
      session.charge?.completed_at ??
      session.completed_at ??
      session.charge?.created_at ??
      session.created_at ??
      null,
    metadata: normalizeMetadata(session.metadata),
  };
}

export async function createCheckoutSession(input: {
  email: string;
  amountMinor: number;
  currency: PaymentCurrency;
  reference: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}): Promise<BachsCheckout> {
  const data = await bachsRequest<BachsCheckoutSession>("/v1/checkout-sessions", {
    method: "POST",
    headers: { "Idempotency-Key": input.reference },
    body: JSON.stringify({
      pricing: {
        currency: input.currency,
        amount: minorToDecimal(input.amountMinor),
      },
      customer: { email: input.email },
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      reference: input.reference,
      metadata: input.metadata,
    }),
  });

  const checkoutId = data.checkout_id ?? data.id;
  if (!checkoutId || !data.checkout_url) throw new Error("Bachs did not return a checkout URL");
  return { checkoutId, checkoutUrl: data.checkout_url };
}

export async function retrieveCheckoutSession(checkoutId: string): Promise<PaymentVerifyData | null> {
  try {
    const data = await bachsRequest<BachsCheckoutSession>(
      `/v1/checkout-sessions/${encodeURIComponent(checkoutId)}`,
    );
    return toVerifyData(data);
  } catch (error) {
    console.warn("[bachs/verify]", error);
    return null;
  }
}

function safeEqualHex(expected: string, actual: string): boolean {
  try {
    const expectedBuffer = Buffer.from(expected, "hex");
    const actualBuffer = Buffer.from(actual, "hex");
    return expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch {
    return false;
  }
}

export function verifyBachsWebhook(rawBody: string, headers: Headers, nowSeconds = Math.floor(Date.now() / 1000)): boolean {
  const secret = process.env.BACHS_WEBHOOK_SECRET?.trim();
  if (!secret) throw new Error("BACHS_WEBHOOK_SECRET is not configured");

  const v2 = headers.get("x-bachs-signature-v2");
  const legacyTimestamp = headers.get("x-bachs-timestamp");
  const legacySignature = headers.get("x-bachs-signature");
  let timestamp = legacyTimestamp;
  let signatures = legacySignature ? [legacySignature] : [];

  if (v2) {
    const parts = v2.split(",").map((part) => part.trim());
    timestamp = parts.find((part) => part.startsWith("t="))?.slice(2) ?? timestamp;
    signatures = parts.filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));
  }

  const timestampNumber = Number(timestamp);
  if (!timestamp || !Number.isFinite(timestampNumber) || Math.abs(nowSeconds - timestampNumber) > 300) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  return signatures.some((signature) => safeEqualHex(expected, signature));
}
