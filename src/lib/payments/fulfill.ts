import { paymentMismatch } from "@/lib/payments/match";
import { getPlanMonths, isKnownPlanId } from "@/lib/payments/plans";
import { isPaymentPaid, type PaymentVerifyData } from "@/lib/payments/provider";
import {
  findPaymentByReference,
  markPaymentFailed,
  markPaymentFulfilled,
} from "@/lib/payments/records";
import { activatePremium, findUserById } from "@/lib/auth/users";
import { getMongoClient } from "@/lib/db/mongodb";
import { ensurePaymentNotificationEmails, notifyAdminPaymentProblem } from "@/lib/email/payment-notifications";

export interface FulfillResult {
  ok: boolean;
  alreadyFulfilled?: boolean;
  error?: string;
  expiryDate?: Date;
  /** Permanent failures — webhook should return 200 so the provider stops retrying */
  permanent?: boolean;
  /** Transient failures — webhook should return 500 so the provider retries */
  retryable?: boolean;
}

type RejectedPaid = { userId: string; planId: string; amountMinor: number; currency: string; reason: string };

export async function fulfillPayment(
  reference: string,
  paymentData: PaymentVerifyData
): Promise<FulfillResult> {
  let result: FulfillResult = { ok: false, error: "Payment record not found", permanent: true };
  // Set when a payment the customer actually paid is rejected; sent after commit.
  let rejectedPaid: RejectedPaid | null = null;
  try {
    const client = await getMongoClient();
    await client.withSession(async (session) => {
      await session.withTransaction(async () => {
        rejectedPaid = null; // withTransaction can re-run this callback
        const payment = await findPaymentByReference(reference, session);
        if (!payment) return;

        /** Mark the payment failed; alert once if the customer was actually charged. */
        const reject = async (reason: string, error: string) => {
          const changed = await markPaymentFailed(reference, reason, session);
          if (changed && isPaymentPaid(paymentData.status)) {
            rejectedPaid = {
              userId: payment.userId,
              planId: String(payment.planId),
              amountMinor: payment.amountMinor,
              currency: payment.currency,
              reason,
            };
          }
          result = { ok: false, error, permanent: true };
        };
        if (payment.premiumActivated) {
          result = { ok: true, alreadyFulfilled: true };
          return;
        }
        if (paymentData.reference && paymentData.reference !== payment.reference) {
          result = { ok: false, error: "Payment reference mismatch", permanent: true };
          return;
        }

        if (!isKnownPlanId(payment.planId)) {
          await reject("Invalid plan", "Invalid plan");
          return;
        }

        if (payment.status !== "success") {
          const mismatch = paymentMismatch(paymentData, payment);
          if (mismatch) {
            await reject(
              mismatch === "Payment not successful"
                ? `Provider status: ${paymentData.status}`
                : `${mismatch}: Bachs reported ${paymentData.amount} ${paymentData.currency}`,
              mismatch,
            );
            return;
          }

          const metaUserId = paymentData.metadata?.user_id;
          const metaPlanId = paymentData.metadata?.plan_id;
          const metaCurrency = paymentData.metadata?.currency
            ? String(paymentData.metadata.currency).toUpperCase()
            : undefined;
          if (metaUserId && metaUserId !== payment.userId) {
            await reject("User mismatch in metadata", "User mismatch");
            return;
          }
          if (metaPlanId && metaPlanId !== payment.planId) {
            await reject("Plan mismatch in metadata", "Plan mismatch");
            return;
          }
          if (metaCurrency && metaCurrency !== payment.currency) {
            await reject("Currency mismatch in metadata", "Currency mismatch in metadata");
            return;
          }
        }

        // Claim first, then grant: if another request already claimed this
        // payment, it has (or will have) granted Premium, so this one must not.
        const paidAt = paymentData.paid_at ? new Date(paymentData.paid_at) : new Date();
        const claimed = await markPaymentFulfilled(reference, paidAt, session);
        if (!claimed) {
          result = { ok: true, alreadyFulfilled: true };
          return;
        }
        const expiryDate = await activatePremium(
          payment.userId,
          getPlanMonths(payment.planId),
          session,
        );
        result = { ok: true, expiryDate };
      });
    });

    if (result.ok) {
      await ensurePaymentNotificationEmails(reference);
    }
    const rejected = rejectedPaid as RejectedPaid | null;
    if (rejected) {
      const user = await findUserById(rejected.userId).catch(() => null);
      await notifyAdminPaymentProblem({
        headline: "A paid payment was rejected",
        summary: "Bachs reports this payment as paid, but VMC's checks rejected it, so Premium was NOT activated.",
        action: "Check the reason below. If the customer did pay the right amount, activate Premium for them in the admin panel; otherwise refund them in the Bachs dashboard.",
        details: {
          Reason: rejected.reason,
          "Payment ref": reference,
          Customer: user?.email ?? rejected.userId,
          Plan: rejected.planId,
          "Expected amount": `${(rejected.amountMinor / 100).toFixed(2)} ${rejected.currency}`,
          "Bachs amount": `${paymentData.amount} ${paymentData.currency}`,
        },
      });
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
