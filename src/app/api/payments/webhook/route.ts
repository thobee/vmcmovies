import { NextResponse } from "next/server";
import { retrieveCheckoutSession, verifyBachsWebhook } from "@/lib/payments/bachs";
import { fulfillPayment } from "@/lib/payments/fulfill";
import { isPaymentPaid } from "@/lib/payments/provider";
import { findPaymentByCheckoutId, findPaymentByReference } from "@/lib/payments/records";
import { notifyAdminPaymentProblem } from "@/lib/email/payment-notifications";
import { findUserById } from "@/lib/auth/users";

export const runtime = "nodejs";

type BachsWebhookEvent = {
  id?: string;
  type?: string;
  event?: string;
  data?: {
    checkout_id?: string;
    id?: string;
    reference?: string;
  };
};

/**
 * Money going back to the customer. Event names aren't confirmed against Bachs'
 * docs, so match on the wording rather than exact names. Alert-only: we don't yet
 * know the payload shape (full vs partial refund) needed to revoke Premium safely.
 */
const REVERSAL_EVENT = /refund|dispute|chargeback|reversal/i;

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (!verifyBachsWebhook(rawBody, request.headers)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as BachsWebhookEvent;
    const eventType = event.type ?? event.event ?? "";

    if (REVERSAL_EVENT.test(eventType)) {
      await alertReversal(event, eventType);
      return NextResponse.json({ received: true });
    }

    if (eventType !== "checkout.completed" && eventType !== "collection.succeeded") {
      return NextResponse.json({ received: true });
    }

    const checkoutId =
      event.data?.checkout_id ?? (eventType === "checkout.completed" ? event.data?.id : undefined);
    if (!checkoutId) {
      await notifyAdminPaymentProblem({
        headline: "Bachs payment webhook had no checkout ID",
        summary: `A signed "${eventType}" event arrived without a checkout ID, so VMC couldn't match it to a payment.`,
        action: "Find this payment in the Bachs dashboard and activate Premium for the customer manually if they were charged.",
        details: { "Event type": eventType, "Event id": event.id, "Bachs reference": event.data?.reference },
      });
      return NextResponse.json({ error: "Missing checkout ID" }, { status: 400 });
    }

    const paymentData = await retrieveCheckoutSession(checkoutId);
    // Primary lookup by the checkout ID we stored; fall back to the reference we
    // generated and sent to Bachs, so a missing/renamed field doesn't drop a paid event.
    const payment =
      (await findPaymentByCheckoutId(checkoutId)) ??
      (paymentData?.reference ? await findPaymentByReference(paymentData.reference) : null) ??
      (event.data?.reference ? await findPaymentByReference(event.data.reference) : null);

    if (!paymentData || !isPaymentPaid(paymentData.status)) {
      // Bachs couldn't confirm yet (or the lookup failed): ask Bachs to retry.
      return NextResponse.json({ error: "Payment is not confirmed" }, { status: 500 });
    }

    if (!payment) {
      await notifyAdminPaymentProblem({
        headline: "Paid checkout with no matching VMC payment",
        summary: "Bachs confirmed this checkout as paid, but VMC has no payment record for it, so no Premium was activated.",
        action: "Look the checkout up in the Bachs dashboard, find the customer, and activate Premium manually (or refund them).",
        details: {
          "Checkout id": checkoutId,
          "Bachs reference": paymentData.reference,
          "Bachs amount": `${paymentData.amount} ${paymentData.currency}`,
          "Event type": eventType,
        },
      });
      return NextResponse.json({ received: true, error: "Payment not found" });
    }

    const result = await fulfillPayment(payment.reference, paymentData);
    if (!result.ok && result.retryable) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ received: true, error: result.ok ? undefined : result.error });
  } catch (error) {
    console.error("[payments/webhook]", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}

async function alertReversal(event: BachsWebhookEvent, eventType: string): Promise<void> {
  const checkoutId = event.data?.checkout_id ?? event.data?.id;
  const payment =
    (checkoutId ? await findPaymentByCheckoutId(checkoutId) : null) ??
    (event.data?.reference ? await findPaymentByReference(event.data.reference) : null);
  const user = payment ? await findUserById(payment.userId).catch(() => null) : null;

  await notifyAdminPaymentProblem({
    headline: `Bachs ${eventType} — Premium is still active`,
    summary: "Money is going back to a customer (refund or dispute). VMC does not remove Premium automatically yet.",
    action: user
      ? "If this is a full refund or a lost dispute, set this customer's Premium to expired in the admin Users page."
      : "VMC couldn't match this to a payment. Find the customer in the Bachs dashboard and adjust their Premium in the admin Users page.",
    details: {
      "Event type": eventType,
      "Event id": event.id,
      Customer: user?.email,
      "Payment ref": payment?.reference ?? event.data?.reference,
      "Checkout id": checkoutId,
      Plan: payment ? String(payment.planId) : undefined,
      "Premium until": user?.premiumExpiryDate ? new Date(user.premiumExpiryDate).toISOString().slice(0, 10) : undefined,
    },
  });
}
