import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { activateWelcomeTrial, findUserById } from "@/lib/auth/users";
import { getBillingConfig } from "@/lib/payments/billing/db";
import { isUserEligibleForWelcomeTrial } from "@/lib/payments/billing/resolve";
import { userHasSuccessfulPayment } from "@/lib/payments/records";
import { clientIp, rateLimited, RATE_LIMIT_MSG } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Log in to continue" }, { status: 401 });

  if (rateLimited(`trial:${session.user.id}:${clientIp(request)}`, 4)) {
    return NextResponse.json({ error: RATE_LIMIT_MSG }, { status: 429 });
  }

  try {
    const [config, user, hasPaid] = await Promise.all([
      getBillingConfig(),
      findUserById(session.user.id),
      userHasSuccessfulPayment(session.user.id),
    ]);

    if (!user || !isUserEligibleForWelcomeTrial(config, user, hasPaid)) {
      return NextResponse.json({ error: "This welcome offer is not available for this account" }, { status: 403 });
    }

    const expiryDate = await activateWelcomeTrial(user._id, config.welcomeTrial.durationDays);
    return NextResponse.json({ ok: true, expiryDate: expiryDate.toISOString() });
  } catch (error) {
    console.error("[trial/activate]", error);
    return NextResponse.json({ error: "Could not activate welcome access" }, { status: 500 });
  }
}
