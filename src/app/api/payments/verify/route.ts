import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import { ensurePaymentNotificationEmails } from "@/lib/email/payment-notifications";
import { fulfillPayment } from "@/lib/payments/fulfill";
import type { BachsVerifyData } from "@/lib/payments/bachs";
import {
  checkoutSessionToVerifyData,
  getCheckoutSession,
  isBachsPaid,
  toVerifyData,
} from "@/lib/payments/bachs";
import {
  findPaymentByCheckoutId,
  findPaymentByReference,
} from "@/lib/payments/records";
import { minorToDecimal } from "@/lib/payments/amount";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function verifyWithRetry(
  checkoutId: string,
  reference: string
): Promise<BachsVerifyData | null> {
  let last = await getCheckoutSession(checkoutId);
  let data = last ? checkoutSessionToVerifyData(last) : null;
  if (data && isBachsPaid(data.status)) return data;

  for (const wait of [1200, 2000, 3000]) {
    await sleep(wait);
    last = await getCheckoutSession(checkoutId);
    data = last ? checkoutSessionToVerifyData(last) : null;
    if (data && isBachsPaid(data.status)) return data;
  }

  return data ?? (last?.reference === reference
    ? checkoutSessionToVerifyData(last)
    : null);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");
    const checkoutId = searchParams.get("checkout_id");

    if (!reference && !checkoutId) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Log in to continue" }, { status: 401 });
    }

    const payment =
      (reference ? await findPaymentByReference(reference) : null) ??
      (checkoutId ? await findPaymentByCheckoutId(checkoutId) : null);

    if (!payment || payment.userId !== session.user.id) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const ref = payment.reference;

    if (payment.premiumActivated) {
      await ensurePaymentNotificationEmails(ref);
      const user = await findUserById(session.user.id);
      return NextResponse.json({
        status: "success",
        alreadyFulfilled: true,
        reference: ref,
        expiryDate: user?.premiumExpiryDate?.toISOString() ?? null,
        paidForYou: true,
      });
    }

    const sessionCheckoutId = payment.checkoutId ?? checkoutId;
    let bachsData =
      sessionCheckoutId ? await verifyWithRetry(sessionCheckoutId, ref) : null;

    if (!bachsData && payment.status === "success") {
      bachsData = toVerifyData({
        reference: ref,
        amount: minorToDecimal(payment.amountMinor),
        currency: payment.currency,
        status: "succeeded",
        paid_at: payment.paidAt?.toISOString() ?? null,
        metadata: { user_id: payment.userId, plan_id: payment.planId },
      });
    }

    if (!bachsData) {
      return NextResponse.json(
        {
          error: "Bachs has not confirmed this charge yet. Wait a few seconds and refresh.",
          retryable: true,
        },
        { status: 502 }
      );
    }

    const result = await fulfillPayment(ref, bachsData);

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
      expiryDate: result.expiryDate?.toISOString() ?? null,
      paidForYou: true,
    });
  } catch (err) {
    console.error("[payments/verify]", err);
    return NextResponse.json(
      { error: "Verification failed", retryable: true },
      { status: 500 }
    );
  }
}
