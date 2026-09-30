import { NextResponse } from "next/server";
import {
  isPaystackPaid,
  toVerifyData,
  verifyWebhookSignature,
  type PaystackTransactionData,
} from "@/lib/payments/paystack";
import { fulfillPayment } from "@/lib/payments/fulfill";

export const runtime = "nodejs";

type CollectionSucceededEvent = {
  event: string;
  data?: PaystackTransactionData;
};

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as CollectionSucceededEvent;

    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const data = event.data;
    const reference = data?.reference;
    if (!reference || typeof data?.amount !== "number" || !data?.currency || !data?.status) {
      return NextResponse.json({ error: "Incomplete webhook payload" }, { status: 400 });
    }

    if (!isPaystackPaid(data.status)) {
      return NextResponse.json({ received: true });
    }

    const result = await fulfillPayment(reference, toVerifyData(data));

    if (!result.ok) {
      if (result.retryable) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      return NextResponse.json({ received: true, error: result.error });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[payments/webhook]", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
