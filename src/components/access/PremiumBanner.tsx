"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Check, DownloadSimple, Lightning, ShieldCheck } from "@phosphor-icons/react";
import type { ResolvedPlanOffer } from "@/lib/payments/billing/types";
import { formatMoney } from "@/lib/payments/currency";
import TelegramIcon from "@/components/brand/TelegramIcon";
import VmcLogo from "@/components/brand/VmcLogo";
import { cn } from "@/lib/cn";

export default function PremiumBanner({
  plans,
  trial,
}: {
  plans: ResolvedPlanOffer[];
  trial: { title: string; body: string; days: number } | null;
}) {
  const entryPrice = plans.find((plan) => plan.id === "monthly")?.display ?? 1_000;

  return (
    <section className="px-4 pb-4 sm:px-6 lg:px-10">
      <div className="relative mx-auto max-w-screen-2xl overflow-hidden rounded-[28px] bg-[#101214] p-1.5 ring-1 ring-inset ring-white/10 sm:rounded-[32px] sm:p-2">
        <div className="relative overflow-hidden rounded-[22px] bg-[#0b0e0f] px-5 py-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] sm:rounded-[25px] sm:px-8 sm:py-10 lg:px-12 lg:py-14 xl:px-14">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 50% 70% at 100% 0%, rgba(34,197,94,0.13), transparent 55%), radial-gradient(ellipse 35% 55% at 0% 100%, rgba(91,141,239,0.07), transparent 58%)",
            }}
          />

          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(23rem,0.72fr)] lg:items-end lg:gap-14 xl:gap-20">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <VmcLogo height={40} priority />
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300 ring-1 ring-inset ring-emerald-400/25">
                  Premium
                </span>
              </div>
              <h2
                className="max-w-2xl text-[1.7rem] font-bold leading-[1.08] text-white sm:text-4xl lg:text-[2.65rem]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Browse free. Download when you&apos;re ready.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/60 sm:text-base sm:leading-7">
                {trial
                  ? trial.body
                  : "Selected titles are free to download. Premium unlocks the rest through Telegram."}
              </p>

              <Link
                href={trial ? "/signup" : "/get-access"}
                className="group mt-7 inline-flex w-full items-center justify-between gap-3 rounded-full bg-emerald-400 py-1.5 pl-6 pr-1.5 text-sm font-bold text-black transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-emerald-300 active:scale-[0.98] sm:w-auto"
              >
                {trial ? `Join for ${trial.days} free days` : "See all plans"}
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/10 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-[1px] group-hover:scale-105">
                  <DownloadSimple className="h-4 w-4" weight="bold" />
                </span>
              </Link>
            </div>

            <aside
              aria-label="Premium plan highlights"
              className="w-full border-y border-white/[0.09] lg:max-w-md lg:justify-self-end"
            >
              <div className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-3 border-b border-white/[0.07] py-4">
                <Lightning className="h-4 w-4 text-emerald-300" weight="fill" />
                <div className="flex min-w-0 items-center justify-between gap-4">
                  <span className="text-xs text-white/40">
                    {trial ? "Launch offer" : "Premium starts at"}
                  </span>
                  <strong className="max-w-48 text-right text-sm font-bold text-white">
                    {trial ? trial.title : formatMoney(entryPrice, "NGN")}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-3 border-b border-white/[0.07] py-4">
                <ShieldCheck className="h-4 w-4 text-white/55" weight="regular" />
                <div className="flex min-w-0 items-center justify-between gap-4">
                  <span className="text-xs text-white/40">Billing</span>
                  <strong className="text-right text-sm font-medium text-white/75">
                    No automatic renewal
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-3 py-4">
                <TelegramIcon className="h-4 w-4 text-[#56bdf0]" />
                <div className="flex min-w-0 items-center justify-between gap-4">
                  <span className="text-xs text-white/40">Downloads</span>
                  <strong className="text-right text-sm font-medium text-white/75">
                    Telegram delivery
                  </strong>
                </div>
              </div>
            </aside>
          </div>

          <div className="relative mt-10 border-t border-white/[0.08] pt-7 sm:mt-12 sm:pt-8">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white sm:text-2xl">Choose your Premium plan</h3>
                <p className="mt-1.5 text-sm text-white/45">
                  One payment. No automatic renewal.
                </p>
              </div>
              <p className="hidden text-xs text-white/50 sm:block">Same access. Choose your duration.</p>
            </div>
            <div className="mb-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/60">
              {["Premium movies & series", "Telegram downloads", "Request titles"].map((benefit) => (
                <span key={benefit} className="inline-flex items-center gap-2"><Check className="size-4 shrink-0 text-emerald-300" />{benefit}</span>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4 xl:gap-5">
              {plans.map((plan, index) => {
                const featured = plan.id === "quarterly";
                const monthlyEquivalent = Math.round(plan.display / plan.months);
                const savings = entryPrice * plan.months - plan.display;

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.65, delay: index * 0.08, ease: [0.32, 0.72, 0, 1] }}
                    className={cn(
                      "rounded-lg ring-1 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                      featured
                        ? "bg-[#111918] ring-emerald-300/40"
                        : "bg-[#111516] ring-white/10 hover:ring-white/25",
                    )}
                  >
                    <Link
                      href={`/get-access?plan=${plan.id}`}
                      className={cn(
                        "group grid h-full grid-cols-[minmax(0,1fr)_auto] gap-x-3 rounded-lg p-4 text-white transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.025] sm:flex sm:min-h-[272px] sm:flex-col sm:justify-between sm:p-5",
                      )}
                    >
                      <div>
                        <div className="flex min-h-7 items-start gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-base font-semibold text-white/85">
                              {plan.name}
                            </p>
                            {plan.badge && (
                              <span
                                className={cn(
                                  "text-xs font-medium text-emerald-300",
                                )}
                              >
                                {featured ? "Recommended" : plan.badge}
                              </span>
                            )}
                          </div>
                        </div>

                        <p
                          className={cn(
                            "mt-3 break-words text-2xl font-bold leading-tight sm:mt-5 sm:text-3xl",
                          )}
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {formatMoney(plan.display, "NGN")}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-white/50">
                          {plan.months === 1 ? "Paid once for 1 month" : `About ${formatMoney(monthlyEquivalent, "NGN")} / month`}
                        </p>

                        <p className="mt-2 text-xs leading-5 text-emerald-300 sm:mt-4">
                          {plan.promoLabel ?? (savings > 0 ? `Save ${formatMoney(savings, "NGN")}` : plan.months === 1 ? "Flexible monthly access" : "Full Premium access")}
                        </p>
                      </div>

                      <div
                        className={cn(
                          "flex flex-col items-end justify-center gap-2 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:border-t sm:border-white/10 sm:pt-4",
                        )}
                      >
                        <span className="text-xs font-semibold text-white/80 sm:text-sm">
                          Choose {plan.months} {plan.months === 1 ? "month" : "months"}
                        </span>
                        <span
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-[1px] group-hover:scale-105",
                            "bg-white/[0.05] text-emerald-300",
                          )}
                        >
                          <ArrowRight className="h-4 w-4" weight="bold" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
