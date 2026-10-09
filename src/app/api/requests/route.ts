import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createTitleRequest } from "@/lib/requests/db";
import { titleRequestSchema } from "@/lib/requests/validation";
import { rateLimited, RATE_LIMIT_MSG } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Log in to request a title" }, { status: 401 });
    }
    if (session.user.premiumStatus !== "active") {
      return NextResponse.json(
        { error: "Premium members can request movies and series" },
        { status: 403 },
      );
    }

    if (await rateLimited(`title-request:${session.user.id}`, 8)) {
      return NextResponse.json({ error: RATE_LIMIT_MSG }, { status: 429 });
    }

    const body = await request.json();
    const parsed = titleRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const item = await createTitleRequest({
      userId: session.user.id,
      email: session.user.email,
      telegramUsername: session.user.telegramUsername,
      title: parsed.data.title,
      type: parsed.data.type,
      year: parsed.data.year,
    });

    return NextResponse.json({ ok: true, id: item._id }, { status: 201 });
  } catch (err) {
    console.error("[requests POST]", err);
    return NextResponse.json({ error: "Could not send request" }, { status: 500 });
  }
}
