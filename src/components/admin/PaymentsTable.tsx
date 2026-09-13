"use client";

import { cn } from "@/lib/cn";

export interface AdminPaymentRow {
  id: string;
  email: string;
  telegramUsername: string;
  planName: string;
  months: number;
  amount: string;
  currency: string;
  status: "pending" | "success" | "failed";
  premiumActivated: boolean;
  paidAt: string | null;
  failureReason: string | null;
  createdAt: string;
}

const STATUS_STYLES = {
  pending: "bg-amber-500/12 text-amber-200 border-amber-500/25",
  success: "bg-emerald-500/12 text-emerald-300 border-emerald-500/25",
  failed: "bg-red-500/12 text-red-300 border-red-500/25",
} as const;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({
  status,
  premiumActivated,
  failureReason,
}: {
  status: AdminPaymentRow["status"];
  premiumActivated: boolean;
  failureReason: string | null;
}) {
  return (
    <div>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
          STATUS_STYLES[status],
        )}
      >
        {status}
        {status === "success" && !premiumActivated && (
          <span className="normal-case font-medium text-amber-300">· no access</span>
        )}
      </span>
      {failureReason && (
        <p className="mt-1 max-w-[220px] truncate text-[10px] text-red-300/80" title={failureReason}>
          {failureReason}
        </p>
      )}
    </div>
  );
}

export default function PaymentsTable({ payments }: { payments: AdminPaymentRow[] }) {
  if (payments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-[#1a1a1a] px-6 py-16 text-center">
        <p className="text-sm text-white/45">
          No payments yet. They&apos;ll appear here after someone pays on Get Access.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl panel overflow-hidden">
      {/* Mobile cards — scrollable */}
      <div className="max-h-[min(70vh,28rem)] overflow-y-auto overscroll-contain md:hidden">
        <div className="space-y-3 p-3">
          {payments.map((p) => (
            <article key={p.id} className="rounded-xl border border-white/[0.06] bg-[#141414] p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{p.email}</p>
                  <p className="text-[11px] text-white/35">@{p.telegramUsername}</p>
                </div>
                <StatusBadge
                  status={p.status}
                  premiumActivated={p.premiumActivated}
                  failureReason={p.failureReason}
                />
              </div>
              <div className="flex items-end justify-between gap-3 text-sm">
                <div>
                  <p className="text-white/50">
                    {p.planName}
                    <span className="text-white/30"> · {p.months} mo</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/30">
                    {formatDate(p.paidAt ?? p.createdAt)}
                  </p>
                </div>
                <p className="whitespace-nowrap font-semibold tabular-nums text-white">
                  {p.amount}
                  <span className="ml-1 text-[10px] font-normal text-white/35">{p.currency}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Desktop table — scrollable body */}
      <div className="hidden md:block max-h-[min(70vh,32rem)] overflow-auto overscroll-contain">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="sticky top-0 z-10 bg-[#1a1a1a] shadow-[0_1px_0_rgba(255,255,255,0.06)]">
            <tr className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-[0.14em] text-white/35">
              <th className="px-5 py-3.5 font-semibold w-[22%]">Date</th>
              <th className="px-5 py-3.5 font-semibold w-[30%]">User</th>
              <th className="px-5 py-3.5 font-semibold w-[20%]">Plan</th>
              <th className="px-5 py-3.5 font-semibold w-[14%]">Amount</th>
              <th className="px-5 py-3.5 font-semibold w-[14%]">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr
                key={p.id}
                className="border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.025]"
              >
                <td className="whitespace-nowrap px-5 py-3.5 text-white/50">
                  {formatDate(p.paidAt ?? p.createdAt)}
                </td>
                <td className="px-5 py-3.5">
                  <p className="truncate font-medium text-white">{p.email}</p>
                  <p className="text-[11px] text-white/35">@{p.telegramUsername}</p>
                </td>
                <td className="px-5 py-3.5 text-white/60">
                  {p.planName}
                  <span className="text-xs text-white/30"> · {p.months} mo</span>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 font-semibold text-white">
                  {p.amount}
                  <span className="ml-1 text-[10px] font-normal text-white/35">{p.currency}</span>
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge
                    status={p.status}
                    premiumActivated={p.premiumActivated}
                    failureReason={p.failureReason}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
