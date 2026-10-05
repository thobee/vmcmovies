"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  CircleNotch,
  ClockCountdown,
  DownloadSimple,
  Sparkle,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/payments/currency";
import type { BillingPlansResponse, ResolvedPlanOffer } from "@/lib/payments/billing/types";
import type { PlanId } from "@/lib/payments/plans";
import { useAuth } from "@/components/auth/AuthProvider";
import { Arc } from "@/components/loading-ui/arc";

function formatPrice(display: number) {
  return formatMoney(display, "NGN");
}

export default function PricingGrid({
  isActive = false,
  expiry = null,
  daysRemaining = null,
}: {
  isActive?: boolean;
  expiry?: string | null;
  daysRemaining?: number | null;
}) {
  const { refresh } = useAuth();
  const [selected, setSelected] = useState<PlanId>("quarterly");
  const [billing, setBilling] = useState<BillingPlansResponse | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      setLoadingPlans(true);
      try {
        const res = await fetch("/api/billing/plans?currency=NGN");
        const data = await res.json();
        if (res.ok) setBilling(data as BillingPlansResponse);
      } catch {
        setBilling(null);
      } finally {
        setLoadingPlans(false);
      }
    })();
  }, []);

  const plans = billing?.plans ?? [];
  const selectedPlan = plans.find((plan) => plan.id === selected) ?? plans[0];

  const handlePay = async () => {
    if (!selectedPlan) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan.id, currency: "NGN" }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not start payment");
        return;
      }

      await refresh();
      window.location.href = data.authorizationUrl;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const trialBanner = billing?.trial.active && !isActive;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
            {isActive ? "Extend premium" : "Choose your access"}
          </p>
          <h2
            className="mt-2 text-2xl font-bold text-white sm:text-[2rem]"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
          >
            {isActive ? "Add more time" : "Pick a plan"}
          </h2>
        </div>
        <span className="hidden rounded-full bg-white/[0.05] px-3 py-1.5 text-[10px] font-semibold text-white/40 ring-1 ring-inset ring-white/[0.07] sm:inline-flex">
          One-time payment
        </span>
      </div>

      {isActive && expiry && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-emerald-400/[0.08] px-4 py-3.5 ring-1 ring-inset ring-emerald-300/20">
          <ClockCountdown className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" weight="duotone" />
          <div>
            <p className="text-sm font-semibold text-emerald-200">
              {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining
            </p>
            <p className="mt-0.5 text-xs text-white/55">Active until {expiry}</p>
            <p className="mt-0.5 text-xs text-white/45">Your new time starts after this date.</p>
          </div>
        </div>
      )}

      {trialBanner && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-emerald-400/[0.08] px-4 py-3.5 ring-1 ring-inset ring-emerald-300/20">
          <Sparkle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" weight="fill" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-emerald-200">{billing.trial.bannerTitle}</p>
            <p className="mt-1 text-xs leading-5 text-white/55">{billing.trial.bannerBody}</p>
            <p className="mt-1.5 text-[11px] leading-5 text-white/35">
              {billing.trial.eligible
                ? "Open a Premium title to activate your welcome access."
                : "Available to eligible new members during the launch window."}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6">
        {loadingPlans ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-white/40">
            <Arc className="size-5 text-emerald-300" />
            Loading plans...
          </div>
        ) : plans.length > 0 ? (
          <div className="space-y-2.5" role="radiogroup" aria-label="Premium plans">
            {plans.map((plan: ResolvedPlanOffer) => {
              const active = selectedPlan?.id === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelected(plan.id)}
                  className={cn(
                    "group relative grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 overflow-hidden rounded-2xl px-3.5 py-3.5 text-left ring-1 ring-inset transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:px-4",
                    active
                      ? "bg-emerald-400/[0.11] ring-emerald-300/35"
                      : "bg-black/20 ring-white/[0.07] hover:bg-white/[0.045] hover:ring-white/[0.13]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-1 ring-inset transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                      active
                        ? "bg-emerald-400 text-black ring-emerald-300"
                        : "bg-black/20 text-transparent ring-white/20",
                    )}
                  >
                    <Check className="h-3.5 w-3.5" weight="bold" />
                  </span>

                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white">{plan.name}</span>
                      {plan.badge && (
                        <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-200">
                          {plan.badge}
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-[11px] text-white/40">
                      {plan.promoLabel ?? plan.savings?.NGN ?? "Full premium access"}
                    </span>
                  </span>

                  <span className="text-right">
                    <span
                      className="block text-xl font-bold text-white sm:text-2xl"
                      style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
                    >
                      {formatPrice(plan.display)}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-white/30">one time</span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-red-500/[0.08] px-4 py-5 text-sm text-red-200 ring-1 ring-inset ring-red-400/20">
            Plans could not load. Refresh the page and try again.
          </div>
        )}
      </div>

      {selectedPlan?.footnote && (
        <p className="mt-3 px-1 text-[11px] leading-5 text-white/35">{selectedPlan.footnote}</p>
      )}

      {error && (
        <div className="mt-4 rounded-2xl bg-red-500/[0.09] px-4 py-3 text-sm text-red-200 ring-1 ring-inset ring-red-400/25">
          {error}
        </div>
      )}

      <div className="mt-6 border-t border-white/[0.07] pt-5">
        <button
          type="button"
          onClick={handlePay}
          disabled={loading || !selectedPlan}
          className="group flex min-h-14 w-full items-center justify-between rounded-full bg-emerald-400 py-2 pl-6 pr-2 text-sm font-bold text-black transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-emerald-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="inline-flex items-center gap-2">
            {loading ? (
              <>
                <Arc className="size-4" /> Opening checkout...
              </>
            ) : selectedPlan ? (
              `Continue with ${formatPrice(selectedPlan.display)}`
            ) : (
              "Select a plan"
            )}
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/10 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
            {loading ? (
              <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
            ) : (
              <DownloadSimple className="h-4 w-4" weight="bold" />
            )}
          </span>
        </button>

        <div className="mt-3 flex items-center justify-between gap-3 px-1 text-[11px] text-white/35">
          <span>No automatic renewal</span>
          <Link
            href="/account"
            className="font-semibold text-white/45 transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white"
          >
            Back to account
          </Link>
        </div>
      </div>
    </div>
  );
}
