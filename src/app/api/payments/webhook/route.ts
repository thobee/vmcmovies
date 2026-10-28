import { NextResponse } from "next/server";
import { retrieveCheckoutSession, verifyBachsWebhook } from "@/lib/payments/bachs";
import { fulfillPayment } from "@/lib/payments/fulfill";
import { isPaymentPaid } from "@/lib/payments/provider";
import { findPaymentByCheckoutId } from "@/lib/payments/records";

export const runtime = "nodejs";

type BachsWebhookEvent = {
  id?: string;
  type?: string;
  event?: string;
  data?: {
    checkout_id?: string;
    id?: string;
  };
};

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (!verifyBachsWebhook(rawBody, request.headers)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as BachsWebhookEvent;
    const eventType = event.type ?? event.event;
    if (eventType !== "checkout.completed" && eventType !== "collection.succeeded") {
      return NextResponse.json({ received: true });
    }

    const checkoutId =
      event.data?.checkout_id ?? (eventType === "checkout.completed" ? event.data?.id : undefined);
    if (!checkoutId) {
      return NextResponse.json({ error: "Missing checkout ID" }, { status: 400 });
    }

    const [payment, paymentData] = await Promise.all([
      findPaymentByCheckoutId(checkoutId),
      retrieveCheckoutSession(checkoutId),
    ]);
    if (!payment) return NextResponse.json({ received: true, error: "Payment not found" });
    if (!paymentData || !isPaymentPaid(paymentData.status)) {
      return NextResponse.json({ error: "Payment is not confirmed" }, { status: 500 });
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
