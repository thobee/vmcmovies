import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/mongodb";
import { formatMoney } from "@/lib/payments/currency";
import { getPaymentStats, listPayments } from "@/lib/payments/records";
import { PLANS, getPlanMonths, isKnownPlanId, isPlanId } from "@/lib/payments/plans";
import { ObjectId } from "mongodb";
import { getAdminSession } from "@/lib/admin/session";
import { canAdmin } from "@/lib/admin/permissions";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import PaymentsTable, { type AdminPaymentRow } from "@/components/admin/PaymentsTable";
import { cn } from "@/lib/cn";
import type { Payment } from "@/lib/payments/records";

type CashPoint = {
  label: string;
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

  return points.map(({ label, inflowMinor, outflowMinor }) => ({
    label,
    inflowMinor,
    outflowMinor,
  }));
}

export default async function AdminPaymentsPage() {
  const session = await getAdminSession();
  if (!session || !canAdmin(session.role, "payments")) redirect("/admin");

  let payments: AdminPaymentRow[] = [];
  let movement: CashPoint[] = [];
  let stats = {
    total: 0,
    successful: 0,
    pending: 0,
    failed: 0,
    revenueNgn: formatMoney(0, "NGN"),
    revenueGhs: formatMoney(0, "GHS"),
  };

  try {
    const [paymentDocs, paymentStats] = await Promise.all([
      listPayments(500),
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

    movement = cashMovement(paymentDocs);

    stats = {
      total: paymentStats.total,
      successful: paymentStats.successful,
      pending: paymentStats.pending,
      failed: paymentStats.failed,
      revenueNgn: formatMoney(paymentStats.revenueByCurrency.NGN / 100, "NGN"),
      revenueGhs: formatMoney(paymentStats.revenueByCurrency.GHS / 100, "GHS"),
    };
  } catch {
    // Mongo unavailable
  }

  return (
    <div>
      <AdminPageHeader
        title="Payments"
        badge={`${stats.successful} paid`}
        subtitle="Paystack checkouts, revenue, and premium activation status."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Transactions" value={stats.total} />
        <Stat label="Successful" value={stats.successful} accent="emerald" />
        <Stat label="Revenue (NGN)" value={stats.revenueNgn} small />
        <Stat label="Revenue (GHS)" value={stats.revenueGhs} small />
        <Stat label="Pending" value={stats.pending} small />
        <Stat label="Failed" value={stats.failed} small />
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <CashMovementChart points={movement} />
        <SettlementPanel />
      </div>

      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/30">
        Recent payments
      </p>
      <PaymentsTable payments={payments} />
    </div>
  );
}

function CashMovementChart({ points }: { points: CashPoint[] }) {
  const max = Math.max(1, ...points.map((point) => point.inflowMinor));
  const totalInflow = points.reduce((sum, point) => sum + point.inflowMinor, 0);
  const totalOutflow = points.reduce((sum, point) => sum + point.outflowMinor, 0);

  return (
    <div className="rounded-2xl panel p-4 sm:p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
            Cash movement
          </p>
          <h2 className="mt-1 text-lg font-bold text-white">Last 14 days</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 text-right text-xs">
          <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/10 px-3 py-2">
            <p className="text-white/40">Inflow</p>
            <p className="font-bold text-emerald-200">{formatMoney(totalInflow / 100, "NGN")}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <p className="text-white/40">Outflow</p>
            <p className="font-bold text-white/55">{formatMoney(totalOutflow / 100, "NGN")}</p>
          </div>
        </div>
      </div>

      <div className="flex h-48 items-end gap-2 rounded-2xl border border-white/[0.06] bg-black/20 px-3 pb-3 pt-5">
        {points.map((point) => {
          const height = Math.max(6, Math.round((point.inflowMinor / max) * 100));
          return (
            <div key={point.label} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2">
              <div className="flex flex-1 items-end">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-emerald-500/75 to-emerald-200 shadow-[0_12px_32px_rgba(16,185,129,0.18)]"
                  style={{ height: `${height}%` }}
                  title={`${point.label}: ${formatMoney(point.inflowMinor / 100, "NGN")}`}
                />
              </div>
              <p className="-rotate-45 truncate text-[10px] text-white/30 sm:rotate-0 sm:text-center">
                {point.label}
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs leading-5 text-white/40">
        Inflow is successful Paystack payment value recorded in VMC. Outflow is reserved for future
        expense/refund tracking; Paystack settlement withdrawals happen in Paystack, not from this app.
      </p>
    </div>
  );
}

function SettlementPanel() {
  return (
    <div className="rounded-2xl panel p-4 sm:p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
        Balance & withdrawal
      </p>
      <h2 className="mt-1 text-lg font-bold text-white">Managed by Paystack</h2>
      <p className="mt-3 text-sm leading-6 text-white/50">
        This admin panel records customer payments and premium activation. Available balance,
        settlement timing, bank account, and manual withdrawals should be handled inside your
        Paystack dashboard.
      </p>
      <div className="mt-4 rounded-xl border border-amber-400/15 bg-amber-400/10 px-3 py-3">
        <p className="text-xs leading-5 text-amber-100/80">
          The old in-app withdrawal endpoints are disabled, so admins cannot trigger a payout from
          VMC by mistake.
        </p>
      </div>
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
