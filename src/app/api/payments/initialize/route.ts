import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { isPaymentCurrency } from "@/lib/payments/currency";
import { isPlanId } from "@/lib/payments/plans";
import { generatePaymentReference } from "@/lib/payments/reference";
import { createPendingPayment, setPaymentCheckoutId } from "@/lib/payments/records";
import { paymentReturnBase } from "@/lib/payments/app-url";
import { initializeTransaction } from "@/lib/payments/paystack";
import { resolveChargeForUser } from "@/lib/payments/billing/resolve";
import { clientIp, rateLimited, RATE_LIMIT_MSG } from "@/lib/security/rate-limit";
import { PLANS } from "@/lib/payments/plans";

const bodySchema = z.object({
  planId: z.string(),
  currency: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Log in to continue" }, { status: 401 });
    }

    if (await rateLimited(`pay:${session.user.id}:${clientIp(request)}`, 8)) {
      return NextResponse.json({ error: RATE_LIMIT_MSG }, { status: 429 });
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success || !isPlanId(parsed.data.planId)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const currency = parsed.data.currency ?? "NGN";
    if (!isPaymentCurrency(currency)) {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }

    const planId = parsed.data.planId;
    const pricing = await resolveChargeForUser(session.user.id, planId, currency);
    const plan = PLANS[planId];
    const reference = generatePaymentReference();

    await createPendingPayment({
      userId: session.user.id,
      planId,
      currency,
      amountMinor: pricing.amountMinor,
      reference,
      pricingKind: pricing.pricingKind,
    });

    const origin = paymentReturnBase(request);
    const callbackUrl = `${origin}/payment/callback?reference=${encodeURIComponent(reference)}`;
    const cancelUrl = `${origin}/get-access?cancelled=1`;

    const data = await initializeTransaction({
      email: session.user.email,
      amountMinor: pricing.amountMinor,
      currency,
      reference,
      callbackUrl,
      cancelUrl,
      metadata: {
        user_id: session.user.id,
        plan_id: planId,
        plan_name: plan.name,
        currency,
        pricing_kind: pricing.pricingKind,
      },
    });

    await setPaymentCheckoutId(reference, data.access_code);

    return NextResponse.json({
      authorizationUrl: data.authorization_url,
      reference,
    });
  } catch (err) {
    console.error("[payments/initialize]", err);
    const detail = err instanceof Error ? err.message : "Payment could not start. Try again.";
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? detail
            : "Payment could not start. Try again.",
      },
      { status: 500 },
    );
  }
}
