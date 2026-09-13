import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";
import { decimalToMinor } from "@/lib/payments/amount";
import { getBalances } from "@/lib/payments/bachs";
import { formatMoney } from "@/lib/payments/currency";
import { getWithdrawnTotals, listWithdrawals } from "@/lib/payments/withdrawals";

function mapStatus(status: string): string {
  if (status === "otp") return "awaiting OTP";
  return status;
}

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [balances, withdrawals, totals] = await Promise.all([
      getBalances(),
      listWithdrawals(15),
      getWithdrawnTotals(),
    ]);

    return NextResponse.json({
      balances: balances
        .filter((b) => b.currency === "NGN")
        .map((b) => {
          const balanceMinor = decimalToMinor(b.available_balance);
          return {
            currency: "NGN" as const,
            balanceMinor,
            display: formatMoney(balanceMinor / 100, "NGN"),
          };
        }),
      withdrawnTotals: {
        NGN: {
          minor: totals.NGN,
          display: formatMoney(totals.NGN / 100, "NGN"),
        },
      },
      withdrawals: withdrawals.map((w) => ({
        id: w._id,
        amountMinor: w.amountMinor,
        amountDisplay: formatMoney(w.amountMinor / 100, w.currency),
        currency: w.currency,
        status: w.status,
        statusLabel: mapStatus(w.status),
        reference: w.reference,
        reason: w.reason,
        createdAt: w.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Balance unavailable";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
