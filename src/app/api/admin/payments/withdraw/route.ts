import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/session";
import { displayToDecimal } from "@/lib/payments/amount";
import {
  createPayout,
  createPayoutDestination,
  explainBachsPayoutError,
  resolveBankAccount,
} from "@/lib/payments/bachs";
import { createWithdrawal } from "@/lib/payments/withdrawals";

const bankFields = {
  accountNumber: z
    .string()
    .min(6, "Enter a valid account number")
    .max(20)
    .transform((v) => v.replace(/\s+/g, "")),
  bankCode: z.string().min(1, "Select a bank"),
  bankName: z.string().min(1).optional(),
  accountName: z.string().min(2).max(80).optional(),
};

const withdrawSchema = z.object({
  amount: z.coerce.number().positive("Enter an amount greater than 0"),
  currency: z.literal("NGN").default("NGN"),
  reason: z.string().max(100).optional(),
  ...bankFields,
});

function normalizeStatus(status: string): "pending" | "success" | "failed" {
  const lower = status.toLowerCase();
  if (lower === "paid" || lower === "success" || lower === "completed") return "success";
  if (lower === "failed" || lower === "cancelled" || lower === "canceled") return "failed";
  return "pending";
}

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = withdrawSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { amount, currency, reason, accountNumber, bankCode, bankName } = parsed.data;
    let accountName = parsed.data.accountName?.trim() ?? "";

    if (amount < 1) {
      return NextResponse.json(
        { error: "Minimum withdrawal is 1.00 in the selected currency" },
        { status: 400 }
      );
    }

    try {
      const resolved = await resolveBankAccount({
        accountNumber,
        bankCode,
        currency,
      });
      if (resolved.accountName) accountName = resolved.accountName;
    } catch (err) {
      if (!accountName) {
        const message =
          err instanceof Error ? err.message : "Could not resolve account";
        return NextResponse.json(
          {
            error: `${message}. Enter the account name manually and try again.`,
          },
          { status: 400 }
        );
      }
    }

    if (!accountName) {
      return NextResponse.json(
        { error: "Fetch the account name before withdrawing" },
        { status: 400 }
      );
    }

    const destination = await createPayoutDestination({
      name: accountName,
      currency,
      accountNumber,
      bankCode,
    });

    if (!destination.is_usable) {
      return NextResponse.json(
        {
          error: explainBachsPayoutError(
            "Destination pending review — approve it in the Bachs dashboard, then retry."
          ),
        },
        { status: 400 }
      );
    }

    const reference = `wd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const destLabel = [bankName, accountNumber.slice(-4)].filter(Boolean).join(" ·••");
    const reasonText =
      reason?.trim() ||
      `VMC withdraw → ${accountName}${destLabel ? ` (${destLabel})` : ""}`;

    const amountDecimal = displayToDecimal(amount);
    const data = await createPayout({
      destinationId: destination.id,
      amountDecimal,
      reference,
    });

    const status = normalizeStatus(data.status);
    const amountMinor = Math.round(amount * 100);

    await createWithdrawal({
      amountMinor,
      currency,
      reference: data.reference || reference,
      transferCode: data.id,
      status,
      reason: reasonText,
      createdBy: admin.email,
    });

    return NextResponse.json({
      status,
      transferCode: data.id,
      reference: data.reference || reference,
      amountMinor,
      currency,
      accountName,
      message:
        status === "success"
          ? "Withdrawal completed"
          : "Withdrawal submitted — processing",
    });
  } catch (err) {
    const message = explainBachsPayoutError(
      err instanceof Error ? err.message : "Withdrawal failed"
    );
    console.error("[admin/payments/withdraw]", err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
