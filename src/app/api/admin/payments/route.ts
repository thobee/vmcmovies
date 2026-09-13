import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getAdminSession } from "@/lib/admin/session";
import { getDb } from "@/lib/db/mongodb";
import { formatMoney } from "@/lib/payments/currency";
import { getPlanMonths, isKnownPlanId, isPlanId, PLANS } from "@/lib/payments/plans";
import { getPaymentStats, listPayments } from "@/lib/payments/records";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [payments, stats] = await Promise.all([listPayments(100), getPaymentStats()]);

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
      },
    });
  } catch (err) {
    console.error("[admin/payments GET]", err);
    return NextResponse.json({ error: "Failed to load payments" }, { status: 500 });
  }
}
