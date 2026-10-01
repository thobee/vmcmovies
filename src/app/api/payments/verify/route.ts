import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import { ensurePaymentNotificationEmails } from "@/lib/email/payment-notifications";
import { fulfillPayment } from "@/lib/payments/fulfill";
import type { PaymentVerifyData } from "@/lib/payments/paystack";
import {
  isPaystackPaid,
  toVerifyData,
  verifyTransaction,
} from "@/lib/payments/paystack";
import { findPaymentByReference } from "@/lib/payments/records";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function verifyWithRetry(
  reference: string
): Promise<PaymentVerifyData | null> {
  let data = await verifyTransaction(reference);
  if (data && isPaystackPaid(data.status)) return data;

  for (const wait of [1200, 2000, 3000]) {
    await sleep(wait);
    data = await verifyTransaction(reference);
    if (data && isPaystackPaid(data.status)) return data;
  }

  return data;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference") ?? searchParams.get("trxref");

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const payment = await findPaymentByReference(reference);
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const ref = payment.reference;
    const session = await getSession();
    const paidForYou = session?.user.id === payment.userId;

    if (payment.premiumActivated) {
      await ensurePaymentNotificationEmails(ref);
      const user = paidForYou && session ? await findUserById(session.user.id) : null;
      return NextResponse.json({
        status: "success",
        alreadyFulfilled: true,
        reference: ref,
        expiryDate: user?.premiumExpiryDate?.toISOString() ?? null,
        paidForYou,
      });
    }

    let paymentData = await verifyWithRetry(ref);

    if (!paymentData && payment.status === "success") {
      paymentData = toVerifyData({
        reference: ref,
        amount: payment.amountMinor,
        currency: payment.currency,
        status: "success",
        paid_at: payment.paidAt?.toISOString() ?? null,
        metadata: { user_id: payment.userId, plan_id: payment.planId },
      });
    }

    if (!paymentData) {
      return NextResponse.json(
        {
          error: "Paystack has not confirmed this charge yet. Wait a few seconds and refresh.",
          retryable: true,
        },
        { status: 502 }
      );
    }

    const result = await fulfillPayment(ref, paymentData);

    if (!result.ok) {
      return NextResponse.json(
        { status: "failed", error: result.error, reference: ref, retryable: result.retryable },
        { status: result.retryable ? 503 : 400 }
      );
    }

    return NextResponse.json({
      status: "success",
      alreadyFulfilled: result.alreadyFulfilled ?? false,
      reference: ref,
      expiryDate: paidForYou ? result.expiryDate?.toISOString() ?? null : null,
      paidForYou,
    });
  } catch (err) {
    console.error("[payments/verify]", err);
    return NextResponse.json(
      { error: "Verification failed", retryable: true },
      { status: 500 }
    );
  }
}
