import crypto from "crypto";
import { minorToDecimal } from "@/lib/payments/amount";
import type { PaymentCurrency } from "@/lib/payments/currency";

const PAYSTACK_BASE = "https://api.paystack.co";

type PaystackEnvelope<T> = {
  status: boolean;
  message: string;
  data: T;
};

type PaystackError = {
  message?: string;
  code?: string;
};

export type PaymentVerifyData = {
  reference: string;
  amount: string;
  currency: string;
  status: string;
  paid_at: string | null;
  metadata?: Record<string, string>;
};

export type PaystackInitializeData = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export type PaystackTransactionData = {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at?: string | null;
  created_at?: string | null;
  metadata?: Record<string, string> | string | null;
};

export function getPaystackSecret(): string {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured");
  return key;
}

async function paystackRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${getPaystackSecret()}`);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as PaystackEnvelope<T> & PaystackError;
  if (!res.ok || json.status === false) {
    const detail = [json.message, json.code].filter(Boolean).join(" · ");
    throw new Error(detail || `Paystack request failed (${res.status})`);
  }
  return json.data;
}

function normalizeMetadata(
  metadata: PaystackTransactionData["metadata"],
): Record<string, string> | undefined {
  if (!metadata) return undefined;
  if (typeof metadata === "string") {
    try {
      const parsed = JSON.parse(metadata) as unknown;
      return normalizeMetadata(parsed as PaystackTransactionData["metadata"]);
    } catch {
      return undefined;
    }
  }

  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === "string") normalized[key] = value;
  }
  return normalized;
}

export const PAYSTACK_SUCCESS_STATUSES = new Set(["success"]);

export function isPaystackPaid(status: string): boolean {
  return PAYSTACK_SUCCESS_STATUSES.has(status.toLowerCase());
}

export function toVerifyData(input: PaystackTransactionData): PaymentVerifyData {
  return {
    reference: input.reference,
    amount: minorToDecimal(input.amount),
    currency: input.currency.toUpperCase(),
    status: input.status.toLowerCase(),
    paid_at: input.paid_at ?? input.created_at ?? null,
    metadata: normalizeMetadata(input.metadata),
  };
}

export async function initializeTransaction(input: {
  email: string;
  amountMinor: number;
  currency: PaymentCurrency;
  reference: string;
  callbackUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}): Promise<PaystackInitializeData> {
  return paystackRequest<PaystackInitializeData>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: String(input.amountMinor),
      currency: input.currency,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: {
        ...input.metadata,
        cancel_action: input.cancelUrl,
      },
    }),
  });
}

export async function verifyTransaction(reference: string): Promise<PaymentVerifyData | null> {
  try {
    const data = await paystackRequest<PaystackTransactionData>(
      `/transaction/verify/${encodeURIComponent(reference)}`,
    );
    return toVerifyData(data);
  } catch (err) {
    console.warn("[paystack/verify]", err);
    return null;
  }
}

export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;

  const expected = crypto
    .createHmac("sha512", getPaystackSecret())
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
