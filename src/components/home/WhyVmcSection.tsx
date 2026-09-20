"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  CalendarCheck,
  ChatCircleText,
  LockSimple,
  PaperPlaneTilt,
  ShieldCheck,
  SquaresFour,
  Tag,
} from "@phosphor-icons/react";
import { WHY_VMC_ITEMS } from "@/lib/marketing/why-vmc";
import { cn } from "@/lib/cn";

const ICONS = [
  ShieldCheck,
  SquaresFour,
  PaperPlaneTilt,
  LockSimple,
  CalendarCheck,
  ChatCircleText,
  Tag,
];

export default function WhyVmcSection() {
  return (
    <section className="border-t border-white/10 px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
      <div className="mx-auto max-w-screen-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="max-w-2xl"
        >
          <p className="eyebrow-pill text-[10px]">Why VMC?</p>
          <h2
            className="mt-3 text-[1.65rem] font-semibold leading-tight text-white sm:mt-4 sm:text-[1.85rem] md:text-4xl"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
          >
            No trailers. Just the movie.
          </h2>
          <p className="mt-2.5 text-sm leading-6 text-white/60 sm:mt-3 sm:text-base sm:leading-7">
            A real catalogue, verified downloads, and delivery straight to Telegram — without ads,
            traps, or sketchy sites.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.32, 0.72, 0, 1] }}
          className="mt-10 overflow-hidden rounded-[28px] border border-white/10 bg-[#101214]/80 sm:mt-12"
        >
          <div
            aria-hidden
            className="pointer-events-none h-px w-full bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent"
          />

          <div className="grid gap-8 p-6 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-9 sm:p-8 lg:gap-x-14 lg:p-10">
            {WHY_VMC_ITEMS.map((item, i) => {
              const Icon = ICONS[i % ICONS.length];
              const highlight = i === 2;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.05,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                  className={cn(
                    "group flex gap-4 sm:gap-5",
                    highlight && "sm:col-span-2 sm:max-w-2xl",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition duration-300",
                      highlight
                        ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300"
                        : "border-white/8 bg-white/[0.03] text-emerald-400/70 group-hover:border-emerald-400/25 group-hover:text-emerald-400",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" weight="light" />
                  </span>
                  <div className="min-w-0">
                    <h3
                      className={cn(
                        "font-semibold leading-snug text-white",
                        highlight ? "text-base sm:text-lg" : "text-sm sm:text-[15px]",
                      )}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={cn(
                        "mt-1.5 leading-6 text-white/55",
                        highlight ? "text-sm sm:text-[15px] sm:leading-7" : "text-[13px] sm:text-sm",
                      )}
                    >
                      {item.body}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex flex-col gap-4 border-t border-white/[0.08] bg-white/[0.02] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6 lg:px-10">
            <p className="text-sm text-white/50">
              Browse free. Pay only when you want downloads.
            </p>
            <Link
              href="/get-access"
              className="btn-nested-primary group/btn w-fit bg-emerald-400 text-sm text-black"
            >
              Get premium access
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/10 transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-[1px]">
                <ArrowRight className="h-3.5 w-3.5" weight="bold" />
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
