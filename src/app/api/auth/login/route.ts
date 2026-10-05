import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation/auth";
import { verifyPassword } from "@/lib/auth/password";
import {
  effectivePremiumStatus,
  findUserByEmail,
} from "@/lib/auth/users";
import { createSession } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/admin/permissions";
import { honeypotTripped } from "@/lib/security/honeypot";
import { clientIp, rateLimited, RATE_LIMIT_MSG } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (honeypotTripped(body)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const ip = clientIp(request);
    if (rateLimited(`login:${ip}`, 8)) {
      return NextResponse.json({ error: RATE_LIMIT_MSG }, { status: 429 });
    }

    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password, remember } = parsed.data;
    const user = await findUserByEmail(email);

    if (!user || isAdminRole(user.role) || !user.passwordHash) {
      if (user && !isAdminRole(user.role) && !user.passwordHash) {
        return NextResponse.json(
          { error: "This account uses Google sign-in. Use the Google button below." },
          { status: 401 },
        );
      }
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await createSession(user._id, remember === true);
    const premiumStatus = effectivePremiumStatus(user);

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        telegramUsername: user.telegramUsername,
        role: user.role,
        premiumStatus,
        premiumExpiryDate: user.premiumExpiryDate?.toISOString() ?? null,
        premiumSource: user.premiumSource ?? null,
        welcomeTrialStartedAt: user.welcomeTrialStartedAt?.toISOString() ?? null,
        welcomeTrialExpiryDate: user.welcomeTrialExpiryDate?.toISOString() ?? null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed";
    if (
      message.includes("bad auth") ||
      message.includes("Authentication failed") ||
      message.includes("MongoServerError") ||
      message.includes("ECONNREFUSED") ||
      message.includes("MONGODB_URI") ||
      message.includes("AUTH_SECRET")
    ) {
      return NextResponse.json(
        { error: "Service temporarily unavailable. Try again shortly." },
        { status: 503 }
      );
    }
    console.error("[login]", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
