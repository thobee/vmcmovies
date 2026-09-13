import { NextResponse } from "next/server";
import { z } from "zod";
import {
  completeAdminPasswordReset,
  requestAdminPasswordReset,
} from "@/lib/admin/password-reset";

const requestSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4).max(8),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/** ponytail: in-memory only — Redis if you run multiple instances. */
const WINDOW_MS = 15 * 60 * 1000;
const MAX = 5;
const hits = new Map<string, { n: number; reset: number }>();

function limited(key: string): boolean {
  const now = Date.now();
  const row = hits.get(key);
  if (!row || now > row.reset) {
    hits.set(key, { n: 1, reset: now + WINDOW_MS });
    return false;
  }
  row.n += 1;
  return row.n > MAX;
}

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: Request) {
  try {
    if (limited(`ip:${clientIp(request)}`)) {
      return NextResponse.json(
        { error: "Too many attempts. Try again in 15 minutes." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const action = body?.action === "reset" ? "reset" : "request";

    if (action === "request") {
      const parsed = requestSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
      }
      if (limited(`req:${parsed.data.email.toLowerCase()}`)) {
        return NextResponse.json(
          { error: "Too many requests. Try again in 15 minutes." },
          { status: 429 }
        );
      }
      const result = await requestAdminPasswordReset(parsed.data.email);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      return NextResponse.json({
        ok: true,
        message: "If that email is an admin account, we sent a 6-digit code.",
      });
    }

    const parsed = resetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    if (limited(`rst:${parsed.data.email.toLowerCase()}`)) {
      return NextResponse.json(
        { error: "Too many attempts. Try again in 15 minutes." },
        { status: 429 }
      );
    }

    const result = await completeAdminPasswordReset(parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ ok: true, message: "Password updated. You can sign in now." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Reset failed";
    console.error("[admin/password-reset]", err);
    if (message.includes("MONGODB_URI")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
