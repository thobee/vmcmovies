import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getAdminSession } from "@/lib/admin/session";
import { canAdmin } from "@/lib/admin/permissions";
import { getDb } from "@/lib/db/mongodb";
import { formatMoney } from "@/lib/payments/currency";
import { getPlanMonths, isKnownPlanId, isPlanId, PLANS } from "@/lib/payments/plans";
import { getPaymentStats, listPayments, type Payment } from "@/lib/payments/records";

type CashPoint = {
  label: string;
  date: string;
  inflowMinor: number;
  outflowMinor: number;
};

function cashMovement(payments: Payment[], days = 14): CashPoint[] {
  const today = new Date();
  const points = Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (days - 1 - index));
    return {
      date,
      label: date.toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
      inflowMinor: 0,
      outflowMinor: 0,
    };
  });

  const byDay = new Map(points.map((point) => [point.date.toISOString().slice(0, 10), point]));

  for (const payment of payments) {
    if (payment.status !== "success" || payment.currency !== "NGN") continue;
    const paidAt = payment.paidAt ?? payment.updatedAt;
    const key = paidAt.toISOString().slice(0, 10);
    const point = byDay.get(key);
    if (point) point.inflowMinor += payment.amountMinor;
  }

  return points.map((point) => ({
    label: point.label,
    date: point.date.toISOString().slice(0, 10),
    inflowMinor: point.inflowMinor,
    outflowMinor: point.outflowMinor,
  }));
}

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canAdmin(admin.role, "payments")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [payments, stats] = await Promise.all([listPayments(500), getPaymentStats()]);

    const userIds = [...new Set(payments.map((p) => p.userId))].filter((id) =>
      ObjectId.isValid(id)
    );
    const db = await getDb();
    const userDocs = await db
      .collection("users")
      .find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } })
      .project({ email: 1, telegramUsername: 1 })
      .toArray();

    const userMap = new Map(
      userDocs.map((u) => [
        u._id.toString(),
        {
          email: u.email as string,
          telegramUsername: u.telegramUsername as string,
        },
      ])
    );

    const rows = payments.map((p) => {
      const user = userMap.get(p.userId);
      const planName =
        p.planId === "quarterly"
          ? "3 Months"
          : isPlanId(p.planId)
            ? PLANS[p.planId].name
            : isKnownPlanId(p.planId)
              ? `${getPlanMonths(p.planId)} Months`
              : String(p.planId);
      const months = isKnownPlanId(p.planId) ? getPlanMonths(p.planId) : isPlanId(p.planId) ? PLANS[p.planId].months : 0;
      return {
        id: p._id,
        userId: p.userId,
        email: user?.email ?? "—",
        telegramUsername: user?.telegramUsername ?? "—",
        planId: p.planId,
        planName,
        months,
        currency: p.currency,
        amount: formatMoney(p.amountMinor / 100, p.currency),
        amountMinor: p.amountMinor,
        status: p.status,
        premiumActivated: p.premiumActivated,
        paidAt: p.paidAt?.toISOString() ?? null,
        failureReason: p.failureReason ?? null,
        createdAt: p.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      payments: rows,
      stats: {
        ...stats,
        revenueNgn: formatMoney(stats.revenueByCurrency.NGN / 100, "NGN"),
        revenueGhs: formatMoney(stats.revenueByCurrency.GHS / 100, "GHS"),
      },
      movement: cashMovement(payments),
      settlement: {
        provider: "Paystack",
        inAppWithdrawals: false,
        note:
          "VMC records payments and premium activation. Balance, settlement, and bank withdrawals are managed in Paystack.",
      },
    });
  } catch (err) {
    console.error("[admin/payments GET]", err);
    return NextResponse.json({ error: "Failed to load payments" }, { status: 500 });
  }
}
