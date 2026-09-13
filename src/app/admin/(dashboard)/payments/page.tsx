import { getDb } from "@/lib/db/mongodb";
import { formatMoney } from "@/lib/payments/currency";
import { getPaymentStats, listPayments } from "@/lib/payments/records";
import { PLANS, getPlanMonths, isKnownPlanId, isPlanId } from "@/lib/payments/plans";
import { ObjectId } from "mongodb";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import PaymentsTable, { type AdminPaymentRow } from "@/components/admin/PaymentsTable";
import BachsWithdraw from "@/components/admin/BachsWithdraw";
import { cn } from "@/lib/cn";

export default async function AdminPaymentsPage() {
  let payments: AdminPaymentRow[] = [];
  let stats = {
    total: 0,
    successful: 0,
    pending: 0,
    failed: 0,
    revenueNgn: formatMoney(0, "NGN"),
  };

  try {
    const [paymentDocs, paymentStats] = await Promise.all([
      listPayments(100),
      getPaymentStats(),
    ]);

    const userIds = [...new Set(paymentDocs.map((p) => p.userId))].filter((id) =>
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
        { email: u.email as string, telegramUsername: u.telegramUsername as string },
      ])
    );

    payments = paymentDocs.map((p) => {
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
        email: user?.email ?? "—",
        telegramUsername: user?.telegramUsername ?? "—",
        planName,
        months,
        amount: formatMoney(p.amountMinor / 100, p.currency),
        currency: p.currency,
        status: p.status,
        premiumActivated: p.premiumActivated,
        paidAt: p.paidAt?.toISOString() ?? null,
        failureReason: p.failureReason ?? null,
        createdAt: p.createdAt.toISOString(),
      };
    });

    stats = {
      total: paymentStats.total,
      successful: paymentStats.successful,
      pending: paymentStats.pending,
      failed: paymentStats.failed,
      revenueNgn: formatMoney(paymentStats.revenueByCurrency.NGN / 100, "NGN"),
    };
  } catch {
    // Mongo unavailable
  }

  return (
    <div>
      <AdminPageHeader
        title="Payments"
        badge={`${stats.successful} paid`}
        subtitle="Bachs checkouts, revenue, and withdrawals to your bank account."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Transactions" value={stats.total} />
        <Stat label="Successful" value={stats.successful} accent="emerald" />
        <Stat label="Revenue (NGN)" value={stats.revenueNgn} small />
      </div>

      <BachsWithdraw />

      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/30">
        Recent payments
      </p>
      <PaymentsTable payments={payments} />
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  small,
}: {
  label: string;
  value: string | number;
  accent?: "emerald";
  small?: boolean;
}) {
  return (
    <div className="rounded-2xl panel px-4 py-4">
      <p className="text-[10px] uppercase tracking-widest text-white/35 mb-1.5">{label}</p>
      <p
        className={cn(
          "font-bold tabular-nums tracking-tight",
          small ? "text-lg text-white" : "text-2xl",
          !small && (accent === "emerald" ? "text-emerald-300" : "text-white")
        )}
      >
        {value}
      </p>
    </div>
  );
}
