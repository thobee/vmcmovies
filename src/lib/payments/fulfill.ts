import { paymentMismatch } from "@/lib/payments/match";
import { getPlanMonths, isKnownPlanId } from "@/lib/payments/plans";
import type { PaymentVerifyData } from "@/lib/payments/paystack";
import {
  findPaymentByReference,
  markPaymentFailed,
  markPaymentFulfilled,
  markPremiumActivated,
} from "@/lib/payments/records";
import { activatePremium } from "@/lib/auth/users";
import { ensurePaymentNotificationEmails } from "@/lib/email/payment-notifications";

export interface FulfillResult {
  ok: boolean;
  alreadyFulfilled?: boolean;
  error?: string;
  expiryDate?: Date;
  /** Permanent failures — webhook should return 200 so Paystack stops retrying */
  permanent?: boolean;
  /** Transient failures — webhook should return 500 so Paystack retries */
  retryable?: boolean;
}

export async function fulfillPayment(
  reference: string,
  paymentData: PaymentVerifyData
): Promise<FulfillResult> {
  const payment = await findPaymentByReference(reference);

  if (!payment) {
    return { ok: false, error: "Payment record not found", permanent: true };
  }

  if (payment.premiumActivated) {
    await ensurePaymentNotificationEmails(reference);
    return { ok: true, alreadyFulfilled: true };
  }

  const planMonths = isKnownPlanId(payment.planId) ? getPlanMonths(payment.planId) : 1;
  if (!isKnownPlanId(payment.planId)) {
    await markPaymentFailed(reference, "Invalid plan");
    return { ok: false, error: "Invalid plan", permanent: true };
  }

  const currency = payment.currency;

  if (payment.status === "success") {
    try {
      const expiryDate = await activatePremium(payment.userId, planMonths);
      await markPremiumActivated(reference);
      await ensurePaymentNotificationEmails(reference);
      return { ok: true, expiryDate };
    } catch (err) {
      console.error("[fulfill] recovery activation failed", reference, err);
      return {
        ok: false,
        error: "Premium activation failed",
        retryable: true,
      };
    }
  }

  const mismatch = paymentMismatch(paymentData, payment);
  if (mismatch) {
    if (mismatch === "Payment not successful") {
      await markPaymentFailed(reference, `Paystack status: ${paymentData.status}`);
    }
    return { ok: false, error: mismatch, permanent: true };
  }

  const metaUserId = paymentData.metadata?.user_id;
  if (metaUserId && metaUserId !== payment.userId) {
    await markPaymentFailed(reference, "User mismatch in metadata");
    return { ok: false, error: "User mismatch", permanent: true };
  }

  const metaPlanId = paymentData.metadata?.plan_id;
  if (metaPlanId && metaPlanId !== payment.planId) {
    await markPaymentFailed(reference, "Plan mismatch in metadata");
    return { ok: false, error: "Plan mismatch", permanent: true };
  }

  const metaCurrency = paymentData.metadata?.currency
    ? String(paymentData.metadata.currency).toUpperCase()
    : undefined;
  if (metaCurrency && metaCurrency !== currency) {
    await markPaymentFailed(reference, "Currency mismatch in metadata");
    return { ok: false, error: "Currency mismatch in metadata", permanent: true };
  }

  try {
    const expiryDate = await activatePremium(payment.userId, planMonths);
    const paidAt = paymentData.paid_at ? new Date(paymentData.paid_at) : new Date();
    const updated = await markPaymentFulfilled(reference, paidAt);

    if (!updated?.premiumActivated) {
      const existing = await findPaymentByReference(reference);
      if (existing?.premiumActivated) {
        await ensurePaymentNotificationEmails(reference);
        return { ok: true, alreadyFulfilled: true, expiryDate };
      }
      return {
        ok: false,
        error: "Could not mark payment as fulfilled",
        retryable: true,
      };
    }

    await ensurePaymentNotificationEmails(reference);
    return { ok: true, expiryDate };
  } catch (err) {
    console.error("[fulfill] activation failed", reference, err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Premium activation failed",
      retryable: true,
    };
  }
}
