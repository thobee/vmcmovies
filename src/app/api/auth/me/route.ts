import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  effectivePremiumStatus,
  updateTelegramUsername,
} from "@/lib/auth/users";
import { updateTelegramSchema } from "@/lib/validation/auth";
import type { SessionUser } from "@/lib/auth/types";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({ user: session.user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Session error";
    console.error("[auth/me GET]", err);
    return NextResponse.json({ error: "Session unavailable", user: null }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateTelegramSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { telegramUsername } = parsed.data;
    if (telegramUsername === session.user.telegramUsername) {
      return NextResponse.json({ user: session.user });
    }

    const updated = await updateTelegramUsername(session.user.id, telegramUsername);
    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user: SessionUser = {
      id: updated._id,
      email: updated.email,
      telegramUsername: updated.telegramUsername,
      role: updated.role,
      premiumStatus: effectivePremiumStatus(updated),
      premiumExpiryDate: updated.premiumExpiryDate?.toISOString() ?? null,
    };

    return NextResponse.json({ user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    if (message.includes("MONGODB_URI")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    console.error("[auth/me PATCH]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
