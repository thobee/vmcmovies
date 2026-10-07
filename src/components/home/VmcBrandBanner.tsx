"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle,
  DownloadSimple,
  MagnifyingGlass,
  PaperPlaneTilt,
  Ticket,
} from "@phosphor-icons/react";

const JOURNEY = [
  {
    label: "Find your title",
    detail: "Movies and series in one clean catalogue",
    icon: MagnifyingGlass,
  },
  {
    label: "Check access",
    detail: "Clearly marked Free or Premium",
    icon: Ticket,
  },
  {
    label: "Download on Telegram",
    detail: "Tap once and the bot handles delivery",
    icon: PaperPlaneTilt,
  },
];

const TRUST = ["Verified links", "No ad redirects", "Works on any device"];

export default function VmcBrandBanner() {
  return (
    <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.75, ease: [0.32, 0.72, 0, 1] }}
        className="bezel-outer mx-auto max-w-screen-2xl"
      >
        <div className="bezel-inner relative overflow-hidden border border-white/[0.08] bg-[#0c1110] px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/55 to-transparent"
            aria-hidden
          />

          <div className="grid items-center gap-9 lg:grid-cols-[minmax(0,0.8fr)_minmax(34rem,1.2fr)] lg:gap-12">
            <div className="max-w-xl">
              <p className="eyebrow-pill">The VMC difference</p>
              <h2
                className="mt-4 text-[1.8rem] font-semibold leading-[1.08] text-white sm:text-4xl"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
              >
                From “what should I watch?” to the file in your Telegram.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/58 sm:text-base">
                Find a movie, check if it is Free or Premium, then download it through Telegram.
                No aggressive ads, fake buttons, or confusing pages.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                {TRUST.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/62">
                    <CheckCircle className="h-4 w-4 text-emerald-300" weight="fill" />
                    {item}
                  </span>
                ))}
              </div>
              <Link href="/movies" className="btn-nested-primary group mt-7 w-full justify-between sm:w-fit">
                Browse the catalogue
                <span className="btn-nested-icon bg-black/10 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" weight="bold" />
                </span>
              </Link>
            </div>

            <div className="relative">
              <div className="grid gap-2.5 sm:grid-cols-3">
                {JOURNEY.map((item, index) => (
                  <div
                    key={item.label}
                    className="relative min-h-40 overflow-hidden rounded-2xl bg-white/[0.035] px-5 py-5 ring-1 ring-white/[0.07]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400/12 text-emerald-300">
                        <item.icon className="h-5 w-5" weight="light" />
                      </span>
                      <span className="text-[11px] font-bold tabular-nums text-white/25">0{index + 1}</span>
                    </div>
                    <h3 className="mt-6 text-sm font-bold text-white">{item.label}</h3>
                    <p className="mt-1.5 text-xs leading-5 text-white/45">{item.detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 inline-flex max-w-full items-center gap-3 rounded-xl bg-emerald-400 px-4 py-3 text-black shadow-[0_12px_35px_rgba(16,185,129,0.14)]">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-black/10">
                  <DownloadSimple className="h-5 w-5" weight="bold" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold">One clear route to your download</p>
                  <p className="mt-0.5 text-xs font-medium text-black/65">No pop-ups. No mystery pages. No automatic renewal.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
