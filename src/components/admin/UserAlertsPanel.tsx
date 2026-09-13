"use client";

import { Bell, Clock3, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import type { UserAlert } from "@/lib/admin/user-alerts";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UserAlertsPanel({ alerts }: { alerts: UserAlert[] }) {
  const subscribed = alerts.filter((a) => a.kind === "subscribed");
  const expired = alerts.filter((a) => a.kind === "expired");

  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-[#1a1a1a] px-6 py-16 text-center">
        <Bell className="mx-auto mb-3 h-5 w-5 text-white/25" />
        <p className="text-sm text-white/45">No subscription alerts right now.</p>
        <p className="mt-1 text-xs text-white/30">
          New premiums (14 days) and recently expired plans (30 days) show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {subscribed.length > 0 && (
        <section>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/30">
            New subscriptions · {subscribed.length}
          </p>
          <ul className="space-y-2.5">
            {subscribed.map((a) => (
              <AlertRow key={a.id} alert={a} />
            ))}
          </ul>
        </section>
      )}

      {expired.length > 0 && (
        <section>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/30">
            Expired plans · {expired.length}
          </p>
          <ul className="space-y-2.5">
            {expired.map((a) => (
              <AlertRow key={a.id} alert={a} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function AlertRow({ alert }: { alert: UserAlert }) {
  const isSub = alert.kind === "subscribed";

  return (
    <li className="rounded-2xl panel px-4 py-3.5 sm:px-5 flex gap-3.5 items-start">
      <div
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
          isSub
            ? "border-white/[0.08] bg-white/[0.04] text-white/55"
            : "border-white/[0.08] bg-white/[0.04] text-white/55"
        )}
      >
        {isSub ? <Sparkles className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/50">
            {isSub ? "Subscribed" : "Expired"}
          </span>
          <span className="text-[11px] text-white/30">{formatWhen(alert.at)}</span>
        </div>
        <p className="mt-1.5 text-sm text-white/85 leading-snug">
          {isSub ? (
            <>
              <span className="font-medium text-white">{alert.email}</span>
              {" subscribed to "}
              <span className="font-semibold text-white">{alert.planName}</span>
            </>
          ) : (
            <>
              <span className="font-medium text-white">{alert.email}</span>
              {" — "}
              <span className="font-semibold text-white">{alert.planName}</span>
              {" plan expired"}
            </>
          )}
        </p>
        <p className="mt-1 text-[11px] text-white/35">@{alert.telegramUsername}</p>
      </div>
    </li>
  );
}
