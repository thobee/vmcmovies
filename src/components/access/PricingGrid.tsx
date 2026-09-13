"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Download, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/payments/currency";
import type { BillingPlansResponse, ResolvedPlanOffer } from "@/lib/payments/billing/types";
import type { PlanId } from "@/lib/payments/plans";
import { useAuth } from "@/components/auth/AuthProvider";
import VmcLogo from "@/components/brand/VmcLogo";

function formatPrice(display: number) {
  return formatMoney(display, "NGN");
}

function perMonth(plan: ResolvedPlanOffer): string | null {
  if (plan.months <= 1) return null;
  const monthly = plan.display / plan.months;
  return `${formatMoney(Math.round(monthly), "NGN")}/mo effective`;
}

export default function PricingGrid({
  isActive = false,
  expiry = null,
}: {
  isActive?: boolean;
  expiry?: string | null;
}) {
  const router = useRouter();
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
  const selectedPlan = plans.find((p) => p.id === selected) ?? plans[0];

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

  const launchBanner = billing?.launch.active && billing.launch.eligible;
  const launchEnded = billing?.launch.active === false && billing?.launch.endsAt;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <VmcLogo height={32} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
            Checkout
          </p>
          <h2
            className="text-xl font-bold text-white sm:text-2xl"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
          >
            {isActive ? "Add more time" : "Choose a plan"}
          </h2>
        </div>
      </div>

      {isActive && expiry && (
        <div className="mb-5 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-300">Premium active until {expiry}</p>
          <p className="mt-0.5 text-xs text-white/55">New plans stack on your current date.</p>
        </div>
      )}

      {launchBanner && (
        <div className="mb-5 overflow-hidden rounded-2xl border border-emerald-400/35 bg-emerald-500/10">
          <div className="flex items-start gap-3 px-4 py-3.5">
            <div className="mt-0.5 shrink-0 rounded-xl bg-emerald-500/20 p-1.5">
              <Sparkles className="h-4 w-4 text-emerald-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-emerald-300">{billing.launch.bannerTitle}</p>
              <p className="mt-1 text-xs leading-5 text-white/65">{billing.launch.bannerBody}</p>
              <p className="mt-2 text-[11px] leading-5 text-white/50">{billing.launch.disclosure}</p>
            </div>
            <VmcLogo height={28} className="hidden shrink-0 opacity-80 sm:block" />
          </div>
        </div>
      )}

      {launchEnded && (
        <div className="mb-5 rounded-2xl border border-white/10 bg-white/3 px-4 py-3 text-xs text-white/45">
          Launch pricing has ended. Standard plans below.
        </div>
      )}

      {billing?.launchYearlyUpsell.show && (
        <div className="mb-5 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3.5">
          <p className="text-sm font-semibold text-amber-200">{billing.launchYearlyUpsell.message}</p>
          <button
            type="button"
            onClick={() => setSelected("biannual")}
            className="mt-2 text-xs font-bold uppercase tracking-wide text-amber-300 hover:text-amber-100"
          >
            See 6-month plan →
          </button>
        </div>
      )}

      {!isActive && (
        <p className="mb-4 text-xs leading-5 text-white/45">
          No auto-charge. When a plan ends, pick another to continue — or save with 3-month / 6-month
          plans.
        </p>
      )}

      {loadingPlans ? (
        <div className="mb-6 flex items-center justify-center gap-2 py-14 text-sm text-white/45">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          Loading plans…
        </div>
      ) : (
        <div className="mb-6 grid grid-cols-1 gap-3 sm:gap-3.5">
          {plans.map((plan: ResolvedPlanOffer) => {
            const active = selected === plan.id;
            const featured = plan.id === "quarterly";
            const savings = plan.savings?.NGN;
            const effective = perMonth(plan);

            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelected(plan.id)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border p-4 text-left transition duration-200 sm:p-5",
                  active
                    ? "border-emerald-400/55 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(52,211,153,0.2)]"
                    : featured
                      ? "border-emerald-400/30 bg-black/35 hover:border-emerald-400/45"
                      : "border-white/10 bg-black/30 hover:border-white/20",
                )}
              >
                {plan.badge && (
                  <span
                    className={cn(
                      "absolute -top-px left-1/2 z-10 -translate-x-1/2 rounded-b-lg px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide sm:text-[10px]",
                      featured ? "bg-emerald-400 text-black" : "bg-white/10 text-emerald-300",
                    )}
                  >
                    {plan.badge}
                  </span>
                )}

                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-2 -top-1 opacity-[0.06] transition group-hover:opacity-[0.1]"
                >
                  <VmcLogo height={featured ? 56 : 48} />
                </div>

                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 pt-0.5">
                    <VmcLogo height={22} className="opacity-90" />
                    <div>
                      <p className="text-sm font-semibold text-white sm:text-[15px]">{plan.name}</p>
                      <p className="mt-0.5 text-[11px] text-white/45 sm:text-xs">
                        {plan.months === 1 ? "1 month access" : `${plan.months} months access`}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition",
                      active ? "border-emerald-400 bg-emerald-400" : "border-white/25 bg-black/20",
                    )}
                  >
                    {active && <Check className="h-3.5 w-3.5 text-black" strokeWidth={3} />}
                  </span>
                </div>

                <div className="relative mt-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[1.65rem] font-extrabold leading-none tracking-tight text-white sm:text-[1.85rem]">
                      {formatPrice(plan.display)}
                    </p>
                    {plan.pricingKind === "launch" && (
                      <p className="mt-1.5 text-xs font-semibold text-emerald-300">Launch price</p>
                    )}
                    {plan.promoLabel && (
                      <p className="mt-1 text-xs font-medium text-amber-300">{plan.promoLabel}</p>
                    )}
                    {effective && <p className="mt-1.5 text-xs text-white/45">{effective}</p>}
                  </div>
                  {savings && (
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                      {savings}
                    </span>
                  )}
                </div>

                {plan.footnote && active && (
                  <p className="relative mt-3 rounded-xl border border-white/8 bg-black/25 px-3 py-2.5 text-[11px] leading-5 text-white/50">
                    {plan.footnote}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="sticky bottom-0 z-10 -mx-5 bg-gradient-to-t from-[#101214] from-70% to-transparent px-5 pt-4 pb-1 sm:-mx-8 sm:px-8">
        <button
          type="button"
          onClick={handlePay}
          disabled={loading || !selectedPlan}
          className={cn(
            "auth-btn w-full gap-2 py-3.5 text-sm",
            loading && "cursor-not-allowed opacity-60",
          )}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Opening checkout…
            </>
          ) : selectedPlan ? (
            <>
              <Download className="h-4 w-4" />
              Pay {formatPrice(selectedPlan.display)} — {selectedPlan.name}
            </>
          ) : (
            "Select a plan"
          )}
        </button>

        <button
          type="button"
          onClick={() => router.push("/account")}
          className="mt-2 w-full py-2.5 text-center text-sm text-white/45 transition hover:text-white/80"
        >
          Back to account
        </button>
      </div>
    </div>
  );
}
