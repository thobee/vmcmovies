import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import { ensurePaymentNotificationEmails } from "@/lib/email/payment-notifications";
import { fulfillPayment } from "@/lib/payments/fulfill";
import { retrieveCheckoutSession } from "@/lib/payments/bachs";
import type { PaymentVerifyData } from "@/lib/payments/provider";
import { isPaymentPaid } from "@/lib/payments/provider";
import { findPaymentByCheckoutId, findPaymentByReference } from "@/lib/payments/records";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function verifyWithRetry(
  checkoutId: string
): Promise<PaymentVerifyData | null> {
  let data = await retrieveCheckoutSession(checkoutId);
  if (data && isPaymentPaid(data.status)) return data;

  for (const wait of [1200, 2000, 3000]) {
    await sleep(wait);
    data = await retrieveCheckoutSession(checkoutId);
    if (data && isPaymentPaid(data.status)) return data;
  }

  return data;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference") ?? searchParams.get("trxref");
    const checkoutId = searchParams.get("checkout_id");

    if (!reference && !checkoutId) {
      return NextResponse.json({ error: "Missing payment reference" }, { status: 400 });
    }

    const payment = reference
      ? await findPaymentByReference(reference)
      : await findPaymentByCheckoutId(checkoutId as string);
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }
    if (checkoutId && payment.checkoutId && checkoutId !== payment.checkoutId) {
      return NextResponse.json({ error: "Checkout does not match this payment" }, { status: 400 });
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

    const providerCheckoutId = checkoutId ?? payment.checkoutId;
    let paymentData = providerCheckoutId ? await verifyWithRetry(providerCheckoutId) : null;

    if (!paymentData && payment.status === "success") {
      paymentData = {
        reference: ref,
        amount: (payment.amountMinor / 100).toFixed(2),
        currency: payment.currency,
        status: "success",
        paid_at: payment.paidAt?.toISOString() ?? null,
        metadata: { user_id: payment.userId, plan_id: payment.planId },
      };
    }

    if (!paymentData) {
      return NextResponse.json(
        {
          error: "Bachs has not confirmed this payment yet. Wait a few seconds and refresh.",
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
