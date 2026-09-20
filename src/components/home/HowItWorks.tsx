"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CreditCard, DownloadSimple, MonitorPlay } from "@phosphor-icons/react";

const STEPS = [
  {
    step: "1",
    icon: MonitorPlay,
    title: "Browse movies & series",
    body: "This site is a catalog. Scroll, search, and open any title — looking is free.",
  },
  {
    step: "2",
    icon: CreditCard,
    title: "Get premium",
    body: "Sign up once. That’s what unlocks downloads. Without it, you can still browse.",
  },
  {
    step: "3",
    icon: DownloadSimple,
    title: "Click download",
    body: "Telegram opens. Our bot sends you the movie or series. No extra websites.",
  },
];

export default function HowItWorks() {
  return (
    <section className="border-t border-white/10 px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
      <div className="mx-auto mb-10 max-w-screen-2xl lg:mb-14 lg:flex lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex items-center rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
            How VMC works
          </p>
          <h2
            className="mt-4 text-[1.85rem] font-semibold leading-tight text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
          >
            Browse here. Download on Telegram.
          </h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-white/70">
            VMC shows you movies and series. When you go premium and hit download, a Telegram bot
            sends you the file.
          </p>
        </div>
        <Link
          href="/get-access"
          className="auth-btn mt-6 hidden shrink-0 px-7 py-3 text-sm lg:inline-flex"
        >
          Get premium access
        </Link>
      </div>

      <div className="mx-auto grid max-w-screen-2xl gap-4 sm:grid-cols-3">
        {STEPS.map((item, i) => (
          <motion.article
            key={item.step}
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: i * 0.12, ease: [0.32, 0.72, 0, 1] }}
            className="rounded-[1.75rem] bg-white/[0.03] p-1.5 ring-1 ring-white/[0.06]"
          >
            <div className="flex h-full flex-col rounded-[calc(1.75rem-0.375rem)] border border-white/10 bg-[#101214] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] sm:p-7">
              <div className="mb-5 flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                  <item.icon className="h-5 w-5" weight="light" />
                </span>
                <span className="text-sm font-semibold text-white/50">Step {item.step}</span>
              </div>
              <h3 className="text-lg font-bold leading-snug text-white">{item.title}</h3>
              <p className="mt-2 text-[15px] leading-7 text-white/72">{item.body}</p>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="mt-8 text-center lg:hidden">
        <Link href="/get-access" className="auth-btn px-8 py-3.5 text-sm">
          Get premium access
        </Link>
      </div>
    </section>
  );
}
