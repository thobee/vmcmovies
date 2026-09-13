"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { useAdminToast } from "@/components/admin/toast";
import type { SupportTicket } from "@/lib/support/types";

const CATEGORY_LABELS = {
  payment: "Payment",
  download: "Download",
  account: "Account",
  other: "Other",
} as const;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SupportTable({ tickets }: { tickets: SupportTicket[] }) {
  const router = useRouter();
  const { toast } = useAdminToast();

  const toggleStatus = async (ticket: SupportTicket) => {
    const next = ticket.status === "open" ? "resolved" : "open";
    const res = await fetch("/api/admin/support", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId: ticket._id, status: next }),
    });
    if (res.ok) {
      toast({
        title: next === "resolved" ? "Marked resolved" : "Reopened ticket",
        message: ticket.subject,
      });
      router.refresh();
    } else {
      toast({ title: "Couldn’t update ticket", tone: "error" });
    }
  };

  if (tickets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-[#1a1a1a] px-6 py-16 text-center">
        <p className="text-sm text-white/45">No support messages yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {tickets.map((ticket) => (
        <article
          key={ticket._id}
          className={cn(
            "rounded-2xl panel p-4 sm:p-5",
            ticket.status === "open" && "border-[var(--amber)]/25"
          )}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    ticket.status === "open"
                      ? "border-amber-500/30 bg-amber-500/12 text-amber-200"
                      : "border-white/10 bg-white/[0.04] text-white/45"
                  )}
                >
                  {ticket.status}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-white/35">
                  {CATEGORY_LABELS[ticket.category]}
                </span>
                <span className="text-[10px] text-white/25">{formatDate(ticket.createdAt)}</span>
              </div>
              <h3 className="font-semibold text-white text-[15px] leading-snug">{ticket.subject}</h3>
              <p className="mt-1 text-sm text-white/50 truncate">
                {ticket.email}
                {ticket.telegramUsername && (
                  <span className="text-white/35"> · @{ticket.telegramUsername}</span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleStatus(ticket)}
              className="shrink-0 self-start rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-white/60 hover:text-white hover:border-white/25 hover:bg-white/[0.06] transition-colors"
            >
              Mark {ticket.status === "open" ? "resolved" : "open"}
            </button>
          </div>

          <p className="mt-3 text-sm text-white/65 leading-relaxed whitespace-pre-wrap">
            {ticket.message}
          </p>

          {ticket.paymentReference && (
            <p className="mt-3 rounded-lg bg-[#141414] border border-white/[0.05] px-3 py-2 text-[11px] font-mono text-white/35 break-all">
              Ref: {ticket.paymentReference}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
