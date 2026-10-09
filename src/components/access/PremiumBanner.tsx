"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, DownloadSimple, Lightning, ShieldCheck } from "@phosphor-icons/react";
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
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                  Choose your access
                </p>
                <p className="mt-1.5 text-sm text-white/45">
                  One payment. Your time starts after checkout.
                </p>
              </div>
              <p className="hidden text-xs text-white/30 sm:block">Longer plans save more</p>
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
                      "rounded-[24px] p-1 ring-1 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                      featured
                        ? "bg-emerald-400/12 ring-emerald-300/35"
                        : "bg-white/[0.025] ring-white/[0.07] hover:-translate-y-1 hover:ring-white/[0.14]",
                    )}
                  >
                    <Link
                      href={`/get-access?plan=${plan.id}`}
                      className={cn(
                        "group flex h-full min-h-[226px] flex-col justify-between rounded-[20px] px-5 py-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] lg:min-h-[244px] xl:px-6 xl:py-6",
                        featured
                          ? "bg-emerald-400 text-[#07100c]"
                          : "bg-[#111516] hover:bg-[#14191a]",
                      )}
                    >
                      <div>
                        <div className="flex min-h-7 items-start gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className={cn("text-sm font-bold", featured ? "text-black/70" : "text-white/65")}>
                              {plan.name}
                            </p>
                            {plan.badge && (
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em]",
                                  featured ? "bg-black/10 text-black/65" : "bg-white/[0.07] text-emerald-300",
                                )}
                              >
                                {plan.badge}
                              </span>
                            )}
                          </div>
                        </div>

                        <p
                          className={cn(
                            "mt-5 text-[2.35rem] font-bold leading-none sm:text-[2.6rem] lg:text-[2.15rem] xl:text-[2.65rem]",
                            featured ? "text-black" : "text-white",
                          )}
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {formatMoney(plan.display, "NGN")}
                        </p>
                        <p className={cn("mt-2 text-xs", featured ? "text-black/55" : "text-white/35")}>
                          About {formatMoney(monthlyEquivalent, "NGN")} per month
                        </p>

                        <p className={cn("mt-4 text-xs font-semibold", featured ? "text-black/65" : "text-emerald-300")}>
                          {plan.promoLabel ?? (savings > 0 ? `Save ${formatMoney(savings, "NGN")}` : plan.months === 1 ? "Flexible monthly access" : "Full Premium access")}
                        </p>
                      </div>

                      <div
                        className={cn(
                          "mt-6 flex items-center justify-between border-t pt-4",
                          featured ? "border-black/10" : "border-white/[0.07]",
                        )}
                      >
                        <span className={cn("text-sm font-bold", featured ? "text-black" : "text-white/70")}>
                          Get access
                        </span>
                        <span
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-[1px] group-hover:scale-105",
                            featured ? "bg-black text-white" : "bg-white/[0.07] text-emerald-300",
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
