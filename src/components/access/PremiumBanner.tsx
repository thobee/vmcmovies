import Link from "next/link";
import { ArrowRight, Check, Download } from "lucide-react";
import { PLAN_LIST, PREMIUM_FEATURES, formatPlanPrice, type Plan } from "@/lib/payments/plans";
import VmcLogo from "@/components/brand/VmcLogo";
import { cn } from "@/lib/cn";

function perMonth(plan: Plan): string {
  const monthly = plan.pricing.NGN.display / plan.months;
  return `₦${Math.round(monthly).toLocaleString()}/mo`;
}

export default function PremiumBanner() {
  return (
    <section className="px-4 pb-4 sm:px-6 lg:px-10">
      <div className="relative mx-auto max-w-screen-2xl overflow-hidden rounded-[28px] border border-white/10 bg-[#101214] sm:rounded-[32px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 65% at 100% 0%, rgba(34,197,94,0.16), transparent 52%), radial-gradient(ellipse 40% 50% at 0% 100%, rgba(91,141,239,0.1), transparent 55%)",
          }}
        />

        <div className="relative grid gap-8 p-5 sm:gap-10 sm:p-8 md:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,36rem)] lg:items-center lg:gap-12 lg:p-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,38rem)] xl:gap-14 xl:p-14">
          <div>
            <div className="mb-4 flex items-center gap-2.5 sm:mb-5 sm:gap-3">
              <VmcLogo height={40} priority />
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-400 sm:px-3 sm:py-1 sm:text-xs sm:tracking-[0.16em]">
                Premium
              </span>
            </div>
            <h2
              className="text-[1.5rem] font-bold leading-[1.15] text-white sm:text-[1.85rem] sm:leading-tight md:text-4xl lg:text-[2.35rem]"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
            >
              Browse free. Download when you&apos;re ready.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/70 sm:mt-4 sm:text-base sm:leading-7">
              Premium unlocks direct Telegram downloads. The catalog stays open to everyone.
            </p>
            <p className="mt-2.5 inline-flex rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 sm:mt-3 sm:px-3.5 sm:py-1.5 sm:text-sm">
              Launch offer: first month from ₦700 for new members.
            </p>

            <ul className="mt-5 space-y-2.5 sm:mt-7 sm:space-y-3 md:space-y-3.5">
              {PREMIUM_FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2.5 text-[13px] leading-5 text-white/80 sm:gap-3 sm:text-sm sm:leading-6 md:text-[15px]"
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 sm:h-5 sm:w-5">
                    <Check className="h-3 w-3 text-emerald-400 sm:h-3.5 sm:w-3.5" strokeWidth={2.6} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/get-access"
              className="auth-btn mt-6 inline-flex w-full gap-2 px-6 py-3.5 text-sm sm:mt-8 sm:w-auto sm:px-8 sm:py-4 md:mt-10"
            >
              <Download className="h-4 w-4" />
              See all plans
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3 md:gap-4">
            {PLAN_LIST.map((plan) => {
              const featured = plan.id === "quarterly";
              return (
                <Link
                  key={plan.id}
                  href="/get-access"
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-[20px] border p-4 transition duration-200 sm:rounded-[22px] sm:p-4 md:min-h-[220px] md:p-5 lg:min-h-[240px] lg:p-5 xl:min-h-[260px]",
                    featured
                      ? "order-first border-emerald-400/55 bg-gradient-to-b from-emerald-500/14 to-emerald-500/5 shadow-[0_0_40px_-12px_rgba(52,211,153,0.45)] sm:order-none lg:-mt-2 lg:mb-2 lg:scale-[1.04]"
                      : "border-white/12 bg-black/35 hover:border-white/22 hover:bg-black/45",
                  )}
                >
                  {plan.badge && (
                    <span
                      className={cn(
                        "absolute -top-px left-1/2 z-10 -translate-x-1/2 rounded-b-lg px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide sm:rounded-b-xl sm:px-3 sm:py-1 sm:text-[10px]",
                        featured ? "bg-emerald-400 text-black" : "bg-white/10 text-emerald-300",
                      )}
                    >
                      {plan.badge}
                    </span>
                  )}

                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-3 -top-2 opacity-[0.08] transition group-hover:opacity-[0.12] sm:-right-4 sm:-top-3"
                  >
                    <VmcLogo height={featured ? 64 : 56} />
                  </div>

                  <div className="relative flex items-center justify-between gap-2 pt-0.5 sm:pt-1">
                    <VmcLogo height={26} className="opacity-90" />
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-white/45 sm:text-[11px]">
                      {plan.months === 1 ? "Monthly" : `${plan.months} mo`}
                    </span>
                  </div>

                  <div className="relative mt-3 flex-1 sm:mt-4">
                    <p className="text-sm font-semibold text-white sm:text-base">{plan.name}</p>
                    <p
                      className="mt-2.5 text-[1.75rem] font-extrabold leading-none tracking-tight text-white sm:mt-3 sm:text-[1.35rem] md:mt-4 md:text-[1.65rem] lg:text-[1.85rem] xl:text-[2.15rem]"
                      style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
                    >
                      {formatPlanPrice(plan, "NGN")}
                    </p>
                    {plan.months > 1 && (
                      <p className="mt-1.5 text-xs text-white/50 sm:mt-2 sm:text-sm">
                        {perMonth(plan)} effective
                      </p>
                    )}
                    {plan.savings?.NGN && (
                      <p className="mt-2 inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 sm:mt-3 sm:px-2.5 sm:py-1 sm:text-xs">
                        {plan.savings.NGN}
                      </p>
                    )}
                  </div>

                  <p
                    className={cn(
                      "relative mt-3 flex items-center gap-1.5 text-xs font-semibold transition sm:mt-4 sm:text-sm",
                      featured ? "text-emerald-300" : "text-white/50 group-hover:text-white/75",
                    )}
                  >
                    Get access
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 sm:h-4 sm:w-4" />
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
