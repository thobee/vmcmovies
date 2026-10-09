import { NextResponse } from "next/server";
import { signupSchema } from "@/lib/validation/auth";
import { hashPassword } from "@/lib/auth/password";
import { createUser, findUserByEmail } from "@/lib/auth/users";
import { createSession } from "@/lib/auth/session";
import { honeypotTripped } from "@/lib/security/honeypot";
import { clientIp, rateLimited, RATE_LIMIT_MSG } from "@/lib/security/rate-limit";
import { getBillingConfig } from "@/lib/payments/billing/db";
import { isUserEligibleForWelcomeTrial } from "@/lib/payments/billing/resolve";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (honeypotTripped(body)) {
      return NextResponse.json({ error: "Could not create account" }, { status: 400 });
    }
    if (await rateLimited(`signup:${clientIp(request)}`, 5)) {
      return NextResponse.json({ error: RATE_LIMIT_MSG }, { status: 429 });
    }

    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password, telegramUsername } = parsed.data;

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const [passwordHash, billing] = await Promise.all([
      hashPassword(password),
      getBillingConfig(),
    ]);
    const user = await createUser({ email, passwordHash, telegramUsername });
    await createSession(user._id);
    const welcomeTrialEligible = isUserEligibleForWelcomeTrial(
      billing,
      user,
      false,
    );

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        telegramUsername: user.telegramUsername,
        role: user.role,
        premiumStatus: user.premiumStatus,
        premiumExpiryDate: null,
        premiumSource: null,
        welcomeTrialStartedAt: null,
        welcomeTrialExpiryDate: null,
      },
      welcomeTrial: {
        eligible: welcomeTrialEligible,
        durationDays: billing.welcomeTrial.durationDays,
        title: billing.welcomeTrial.bannerTitle,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signup failed";
    if (message.includes("MONGODB_URI") || message.includes("AUTH_SECRET")) {
      return NextResponse.json(
        { error: "Service temporarily unavailable. Try again shortly." },
        { status: 503 },
      );
    }
    console.error("[signup]", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
