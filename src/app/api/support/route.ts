import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { createSupportTicket } from "@/lib/support/db";
import { honeypotTripped } from "@/lib/security/honeypot";
import { clientIp, rateLimited, RATE_LIMIT_MSG } from "@/lib/security/rate-limit";

const bodySchema = z.object({
  category: z.enum(["payment", "download", "account", "other"]),
  subject: z.string().min(3).max(120),
  message: z.string().min(10).max(4000),
  paymentReference: z.string().max(80).optional(),
  email: z.string().email().optional(),
  telegramUsername: z
    .string()
    .min(1)
    .max(33)
    .transform((v) => v.replace(/^@/, "").trim().toLowerCase())
    .pipe(z.string().regex(/^[a-z0-9_]{3,32}$/, "Enter a valid Telegram username")),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    if (honeypotTripped(body)) {
      return NextResponse.json({ ok: true, ticketId: "ok" }, { status: 201 });
    }
    if (await rateLimited(`support:${session?.user.id ?? clientIp(request)}`, 6)) {
      return NextResponse.json({ error: RATE_LIMIT_MSG }, { status: 429 });
    }
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const email = session?.user.email ?? parsed.data.email;
    if (!email) {
      return NextResponse.json(
        { error: "Log in or provide your email so we can reply" },
        { status: 400 }
      );
    }

    const ticket = await createSupportTicket({
      userId: session?.user.id ?? null,
      email,
      telegramUsername: parsed.data.telegramUsername,
      category: parsed.data.category,
      subject: parsed.data.subject,
      message: parsed.data.message,
      paymentReference: parsed.data.paymentReference,
    });

    return NextResponse.json({ ok: true, ticketId: ticket._id }, { status: 201 });
  } catch (err) {
    console.error("[support POST]", err);
    return NextResponse.json({ error: "Could not send message" }, { status: 500 });
  }
}
