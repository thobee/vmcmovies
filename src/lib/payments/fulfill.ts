import { paymentMismatch } from "@/lib/payments/match";
import { getPlanMonths, isKnownPlanId } from "@/lib/payments/plans";
import type { PaymentVerifyData } from "@/lib/payments/paystack";
import {
  findPaymentByReference,
  markPaymentFailed,
  markPaymentFulfilled,
} from "@/lib/payments/records";
import { activatePremium } from "@/lib/auth/users";
import { getMongoClient } from "@/lib/db/mongodb";
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
  let result: FulfillResult = { ok: false, error: "Payment record not found", permanent: true };
  try {
    const client = await getMongoClient();
    await client.withSession(async (session) => {
      await session.withTransaction(async () => {
        const payment = await findPaymentByReference(reference, session);
        if (!payment) return;
        if (payment.premiumActivated) {
          result = { ok: true, alreadyFulfilled: true };
          return;
        }

        if (!isKnownPlanId(payment.planId)) {
          await markPaymentFailed(reference, "Invalid plan", session);
          result = { ok: false, error: "Invalid plan", permanent: true };
          return;
        }

        if (payment.status !== "success") {
          const mismatch = paymentMismatch(paymentData, payment);
          if (mismatch) {
            if (mismatch === "Payment not successful") {
              await markPaymentFailed(reference, `Paystack status: ${paymentData.status}`, session);
            }
            result = { ok: false, error: mismatch, permanent: true };
            return;
          }

          const metaUserId = paymentData.metadata?.user_id;
          const metaPlanId = paymentData.metadata?.plan_id;
          const metaCurrency = paymentData.metadata?.currency
            ? String(paymentData.metadata.currency).toUpperCase()
            : undefined;
          if (metaUserId && metaUserId !== payment.userId) {
            await markPaymentFailed(reference, "User mismatch in metadata", session);
            result = { ok: false, error: "User mismatch", permanent: true };
            return;
          }
          if (metaPlanId && metaPlanId !== payment.planId) {
            await markPaymentFailed(reference, "Plan mismatch in metadata", session);
            result = { ok: false, error: "Plan mismatch", permanent: true };
            return;
          }
          if (metaCurrency && metaCurrency !== payment.currency) {
            await markPaymentFailed(reference, "Currency mismatch in metadata", session);
            result = { ok: false, error: "Currency mismatch in metadata", permanent: true };
            return;
          }
        }

        const expiryDate = await activatePremium(
          payment.userId,
          getPlanMonths(payment.planId),
          session,
        );
        const paidAt = paymentData.paid_at ? new Date(paymentData.paid_at) : new Date();
        await markPaymentFulfilled(reference, paidAt, session);
        result = { ok: true, expiryDate };
      });
    });

    if (result.ok) {
      await ensurePaymentNotificationEmails(reference);
    }
    return result;
  } catch (err) {
    console.error("[fulfill] activation failed", reference, err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Premium activation failed",
      retryable: true,
    };
  }
}
