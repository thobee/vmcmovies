import { NextResponse } from "next/server";
import { z } from "zod";
import {
  completeUserPasswordReset,
  requestUserPasswordReset,
} from "@/lib/auth/password-reset";
import { passwordSchema } from "@/lib/validation/password";
import { honeypotTripped } from "@/lib/security/honeypot";
import { clientIp, rateLimited, RATE_LIMIT_MSG } from "@/lib/security/rate-limit";

const requestSchema = z.object({ email: z.string().email() });
const resetSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4).max(8),
  password: passwordSchema,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (honeypotTripped(body)) {
      return NextResponse.json({
        ok: true,
        message: "If that email is registered, we sent a 6-digit code.",
      });
    }

    const ip = clientIp(request);
    const action = body?.action === "reset" ? "reset" : "request";

    if (action === "request") {
      const parsed = requestSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
      }
      if (await rateLimited(`pwreq:${ip}:${parsed.data.email.toLowerCase()}`, 5)) {
        return NextResponse.json(
          { error: "Too many requests. Try again in 15 minutes." },
          { status: 429 },
        );
      }
      const result = await requestUserPasswordReset(parsed.data.email);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      return NextResponse.json({
        ok: true,
        message: "If that email is registered, we sent a 6-digit code.",
      });
    }

    const parsed = resetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }
    if (await rateLimited(`pwrst:${ip}:${parsed.data.email.toLowerCase()}`, 5)) {
      return NextResponse.json(
        { error: "Too many attempts. Try again in 15 minutes." },
        { status: 429 },
      );
    }

    const result = await completeUserPasswordReset(parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ ok: true, message: "Password updated. You can sign in now." });
  } catch (err) {
    console.error("[auth/forgot-password]", err);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
