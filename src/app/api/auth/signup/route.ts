import { NextResponse } from "next/server";
import { signupSchema } from "@/lib/validation/auth";
import { hashPassword } from "@/lib/auth/password";
import { createUser, findUserByEmail } from "@/lib/auth/users";
import { createSession } from "@/lib/auth/session";
import { honeypotTripped } from "@/lib/security/honeypot";
import { clientIp, rateLimited, RATE_LIMIT_MSG } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (honeypotTripped(body)) {
      return NextResponse.json({ error: "Could not create account" }, { status: 400 });
    }
    if (rateLimited(`signup:${clientIp(request)}`, 5)) {
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

    const passwordHash = await hashPassword(password);
    const user = await createUser({ email, passwordHash, telegramUsername });
    await createSession(user._id);

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        telegramUsername: user.telegramUsername,
        role: user.role,
        premiumStatus: user.premiumStatus,
        premiumExpiryDate: null,
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
