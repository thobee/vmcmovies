"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CircleNotch, DownloadSimple, Sparkle } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/payments/currency";
import type { BillingPlansResponse, ResolvedPlanOffer } from "@/lib/payments/billing/types";
import type { PlanId } from "@/lib/payments/plans";
import { useAuth } from "@/components/auth/AuthProvider";
import VmcLogo from "@/components/brand/VmcLogo";

function formatPrice(display: number) {
  return formatMoney(display, "NGN");
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
              <Sparkle className="h-4 w-4 text-emerald-300" weight="fill" />
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
          <CircleNotch className="h-4 w-4 animate-spin text-emerald-400" weight="bold" />
          Loading plans…
        </div>
      ) : (
        <div className="mb-6 grid grid-cols-1 gap-3 sm:gap-3.5">
          {plans.map((plan: ResolvedPlanOffer) => {
            const active = selected === plan.id;
            const featured = plan.id === "quarterly";
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelected(plan.id)}
                className={cn(
                  "bezel-outer w-full text-left transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  active && "ring-1 ring-emerald-400/35",
                )}
              >
                <div
                  className={cn(
                    "bezel-inner group relative flex min-h-[168px] flex-col justify-between overflow-hidden border p-5 sm:min-h-[180px] sm:p-6",
                    active
                      ? "border-emerald-400/55 bg-emerald-500/10"
                      : featured
                        ? "border-emerald-400/30 bg-black/35 hover:border-emerald-400/45"
                        : "border-white/10 bg-black/30 hover:border-white/20",
                  )}
                >
                <div className="relative flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    {plan.badge && (
                      <span
                        className={cn(
                          "inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide",
                          featured ? "bg-emerald-400 text-black" : "bg-white/10 text-emerald-300",
                        )}
                      >
                        {plan.badge}
                      </span>
                    )}
                    <div>
                      <p className="text-base font-semibold text-white">{plan.name}</p>
                      <p
                        className="mt-3 text-[2rem] font-semibold leading-none tracking-tight text-white sm:text-[2.15rem]"
                        style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
                      >
                        {formatPrice(plan.display)}
                      </p>
                      {plan.pricingKind === "launch" && (
                        <p className="mt-2 text-xs font-semibold text-emerald-300">Launch price</p>
                      )}
                      {plan.promoLabel && (
                        <p className="mt-1 text-xs font-medium text-amber-300">{plan.promoLabel}</p>
                      )}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition",
                      active ? "border-emerald-400 bg-emerald-400" : "border-white/25 bg-black/20",
                    )}
                  >
                    {active && <Check className="h-4 w-4 text-black" weight="bold" />}
                  </span>
                </div>

                {plan.footnote && active && (
                  <p className="relative mt-3 rounded-xl border border-white/8 bg-black/25 px-3 py-2.5 text-[11px] leading-5 text-white/50">
                    {plan.footnote}
                  </p>
                )}
                </div>
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
              <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
              Opening checkout…
            </>
          ) : selectedPlan ? (
            <>
              <DownloadSimple className="h-4 w-4" weight="bold" />
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
