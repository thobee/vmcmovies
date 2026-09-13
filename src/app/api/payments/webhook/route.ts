import { NextResponse } from "next/server";
import {
  isBachsPaid,
  toVerifyData,
  verifyWebhookSignature,
} from "@/lib/payments/bachs";
import { fulfillPayment } from "@/lib/payments/fulfill";

export const runtime = "nodejs";

type CollectionSucceededEvent = {
  id: string;
  type: string;
  data?: {
    reference?: string | null;
    status?: string;
    amount?: string;
    currency?: string;
    metadata?: Record<string, string>;
    created_at?: string;
  };
};

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const timestamp = request.headers.get("x-bachs-timestamp");
    const signature = request.headers.get("x-bachs-signature");

    if (!verifyWebhookSignature(rawBody, timestamp, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as CollectionSucceededEvent;

    if (event.type !== "collection.succeeded") {
      return NextResponse.json({ received: true });
    }

    const data = event.data;
    const reference = data?.reference;
    if (!reference || !data?.amount || !data?.currency || !data?.status) {
      return NextResponse.json({ error: "Incomplete webhook payload" }, { status: 400 });
    }

    if (!isBachsPaid(data.status)) {
      return NextResponse.json({ received: true });
    }

    const bachsData = toVerifyData({
      reference,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      paid_at: data.created_at ?? null,
      metadata: data.metadata,
    });

    const result = await fulfillPayment(reference, bachsData);

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
