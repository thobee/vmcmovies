import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/session";
import { listBanks, resolveBankAccount } from "@/lib/payments/bachs";
import type { PaymentCurrency } from "@/lib/payments/currency";

export async function GET(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currency: PaymentCurrency = "NGN";

  try {
    const banks = await listBanks(currency);
    return NextResponse.json({
      banks: banks.map((b) => ({ name: b.name, code: b.code })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load banks";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

const resolveSchema = z.object({
  accountNumber: z
    .string()
    .min(6, "Enter a valid account number")
    .max(20)
    .transform((v) => v.replace(/\s+/g, "")),
  bankCode: z.string().min(1, "Select a bank"),
  currency: z.literal("NGN").optional(),
});

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = resolveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const currency: PaymentCurrency = "NGN";
    const resolved = await resolveBankAccount({
      accountNumber: parsed.data.accountNumber,
      bankCode: parsed.data.bankCode,
      currency,
    });

    return NextResponse.json({
      accountNumber: resolved.accountNumber,
      accountName: resolved.accountName,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not resolve account";
    console.error("[admin/payments/recipient resolve]", err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
