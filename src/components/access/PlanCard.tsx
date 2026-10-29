"use client";

import Link from "next/link";
import { ArrowUpRight, Check } from "@phosphor-icons/react";
import type { ResolvedPlanOffer } from "@/lib/payments/billing/types";
import { formatMoney } from "@/lib/payments/currency";
import { cn } from "@/lib/cn";
import { FEATURED_PLAN_ID, planHighlight } from "@/lib/payments/billing/plan-display";

const TAGLINES: Record<string, string> = {
  monthly: "Try Premium for a month",
  quarterly: "A season of new releases",
  biannual: "Half a year, sorted",
  yearly: "Best value for the year",
};

// Every plan unlocks the same things; plans differ only in length and price.
const INCLUDED = ["All movies & series", "Request any movie or series", "Delivered on Telegram", "No auto-renewal"];

type PlanCardProps = {
  plan: ResolvedPlanOffer;
  monthlyPrice: number;
  /** "link" opens /get-access (homepage); "select" is a radio card (checkout page). */
  variant: "link" | "select";
  selected?: boolean;
  onSelect?: () => void;
  /** Link target for the "link" variant; defaults to this plan on /get-access. */
  href?: string;
};

export default function PlanCard({ plan, monthlyPrice, variant, selected = false, onSelect, href }: PlanCardProps) {
  const featured = plan.id === FEATURED_PLAN_ID;
  const tabLabel = featured ? plan.badge || "Most popular" : null;
  const pillLabel = !featured ? plan.badge : null;
  const duration = plan.months === 1 ? "month" : `${plan.months} months`;
  const active = variant === "select" ? selected : featured;

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-base font-semibold text-white">
            {plan.name}
            {pillLabel && (
              <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-300">
                {pillLabel}
              </span>
            )}
          </p>
          <p className="mt-1 text-sm text-white/55">{TAGLINES[plan.id] ?? "Full Premium access"}</p>
        </div>
        {variant === "select" && (
          <span
            aria-hidden
            className={cn(
              "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-1 ring-inset transition-colors duration-200",
              selected ? "bg-emerald-400 text-black ring-emerald-300" : "text-transparent ring-white/25",
            )}
          >
            <Check className="h-3.5 w-3.5" weight="bold" />
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
        <span
          className={cn(
            "text-[2.35rem] font-bold leading-none tabular-nums lg:text-[2.1rem] xl:text-[2.35rem]",
            featured ? "text-emerald-300" : "text-white",
          )}
          style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
        >
          {formatMoney(plan.display, "NGN")}
        </span>
        <span className="whitespace-nowrap text-sm text-white/55">/ {duration}</span>
      </div>

      {variant === "link" && (
        <span
          className={cn(
            "mt-5 flex min-h-11 items-center justify-center gap-2 rounded-full text-sm font-bold transition-colors duration-200",
            featured
              ? "bg-emerald-400 text-black group-hover:bg-emerald-300"
              : "bg-white/[0.05] text-white ring-1 ring-inset ring-white/15 group-hover:bg-white/[0.09]",
          )}
        >
          Get access
          <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px" weight="bold" />
        </span>
      )}

      <ul className="mt-5 space-y-2.5 rounded-2xl bg-white/[0.035] p-4 text-[13px] text-white/75 ring-1 ring-inset ring-white/[0.06]">
        <li className="flex items-center gap-2.5 font-semibold text-emerald-300">
          <Check className="h-4 w-4 shrink-0" weight="bold" />
          {planHighlight(plan, monthlyPrice)}
        </li>
        {INCLUDED.map((item) => (
          <li key={item} className="flex items-center gap-2.5">
            <Check className="h-4 w-4 shrink-0 text-white/45" weight="bold" />
            {item}
          </li>
        ))}
      </ul>
    </>
  );

  const cardClass = cn(
    "group relative z-[1] flex h-full w-full flex-col rounded-[24px] p-5 text-left ring-1 ring-inset transition-[background-color,box-shadow,transform] duration-200 xl:p-6",
    featured ? "bg-[#121a16]" : "bg-[#111516] hover:bg-[#141a1b]",
    active
      ? "ring-2 ring-emerald-400/60 shadow-[0_24px_60px_-24px_rgba(52,211,153,0.4)]"
      : "ring-white/[0.08] hover:ring-white/[0.16]",
  );

  return (
    <div className="relative flex h-full flex-col pt-7">
      {tabLabel && (
        <span className="absolute left-5 top-0 rounded-t-[14px] bg-emerald-400 px-4 pb-4 pt-1.5 text-xs font-bold text-black">
          {tabLabel}
        </span>
      )}
      {variant === "link" ? (
        <Link href={href ?? `/get-access?plan=${plan.id}`} className={cardClass}>
          {body}
        </Link>
      ) : (
        <button type="button" role="radio" aria-checked={selected} onClick={onSelect} className={cn(cardClass, "active:scale-[0.99]")}>
          {body}
        </button>
      )}
    </div>
  );
}
