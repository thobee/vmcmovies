"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Check, DownloadSimple } from "@phosphor-icons/react";
import { PLAN_LIST, PREMIUM_FEATURES, formatPlanPrice } from "@/lib/payments/plans";
import VmcLogo from "@/components/brand/VmcLogo";
import { cn } from "@/lib/cn";

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

        <div className="relative grid gap-8 p-5 sm:gap-10 sm:p-8 md:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,42rem)] lg:items-center lg:gap-14 lg:p-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,46rem)] xl:gap-16 xl:p-14">
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
                    <Check className="h-3 w-3 text-emerald-400 sm:h-3.5 sm:w-3.5" weight="bold" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/get-access"
              className="group mt-6 inline-flex w-full items-center justify-between gap-2.5 rounded-full bg-emerald-400 pl-6 pr-1.5 py-1.5 text-sm font-semibold text-black transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] sm:mt-8 sm:w-auto md:mt-10"
            >
              See all plans
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/10 transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-[1px]">
                <DownloadSimple className="h-4 w-4" weight="bold" />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:gap-5">
            {PLAN_LIST.map((plan, i) => {
              const featured = plan.id === "quarterly";

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.32, 0.72, 0, 1] }}
                  className={cn(
                    featured && "order-first sm:order-none lg:-mt-4 lg:mb-4 lg:scale-[1.06]",
                  )}
                >
                  <div
                    className={cn(
                      "rounded-[1.75rem] p-1 ring-1 transition duration-300 lg:rounded-[2rem]",
                      featured
                        ? "bg-emerald-400/10 ring-emerald-400/25"
                        : "bg-white/[0.03] ring-white/[0.06]",
                    )}
                  >
                    <Link
                      href="/get-access"
                      className={cn(
                        "group relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-[calc(1.75rem-0.25rem)] border p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] sm:min-h-[220px] sm:p-5 md:min-h-[240px] lg:min-h-[280px] lg:rounded-[calc(2rem-0.25rem)] lg:p-6 xl:min-h-[300px] xl:p-7",
                        featured
                          ? "border-emerald-400/45 bg-gradient-to-b from-emerald-500/18 to-emerald-500/[0.04] shadow-[0_0_48px_-12px_rgba(52,211,153,0.55),inset_0_1px_1px_rgba(255,255,255,0.08)]"
                          : "border-white/12 bg-black/40 hover:border-white/22 hover:bg-black/55",
                      )}
                    >
                      <div className="relative space-y-3 lg:space-y-4">
                        {plan.badge && (
                          <span
                            className={cn(
                              "inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide lg:text-[11px]",
                              featured
                                ? "bg-emerald-400 text-black"
                                : "bg-white/10 text-emerald-300",
                            )}
                          >
                            {plan.badge}
                          </span>
                        )}

                        <div>
                          <p className="text-base font-semibold text-white lg:text-lg">
                            {plan.name}
                          </p>
                          <p
                            className="mt-3 text-[2rem] font-semibold leading-none tracking-tight text-white sm:text-[2.15rem] lg:mt-4 lg:text-[2.5rem] xl:text-[2.85rem]"
                            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
                          >
                            {formatPlanPrice(plan, "NGN")}
                          </p>
                        </div>
                      </div>

                      <p
                        className={cn(
                          "relative mt-4 flex items-center gap-1.5 text-sm font-semibold transition lg:mt-6 lg:text-[15px]",
                          featured ? "text-emerald-300" : "text-white/50 group-hover:text-white/75",
                        )}
                      >
                        Get access
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      </p>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
