import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { countAdmins, createUser, findUserByEmail } from "@/lib/auth/users";
import { adminSignupSchema } from "@/lib/validation/auth";

const CLOSED = "Admin signup is closed. An admin already exists — use /admin/login.";

export async function POST(request: Request) {
  try {
    // ponytail: two simultaneous POSTs can both see 0. Fine for bootstrap; a unique lock doc if this ever matters.
    if ((await countAdmins()) > 0) {
      return NextResponse.json({ error: CLOSED }, { status: 403 });
    }

    const body = await request.json();
    const parsed = adminSignupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({
      email,
      passwordHash,
      telegramUsername: email.split("@")[0] || "admin",
      role: "admin",
    });

    return NextResponse.json({ ok: true, email: user.email });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signup failed";
    if (message.includes("MONGODB_URI") || message.includes("AUTH_SECRET")) {
      return NextResponse.json(
        { error: "Service temporarily unavailable. Try again shortly." },
        { status: 503 },
      );
    }
    console.error("[admin/signup]", err);
    return NextResponse.json({ error: "Admin signup failed" }, { status: 500 });
  }
}
