"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react";
import { WHY_VMC_ITEMS } from "@/lib/marketing/why-vmc";
import { cn } from "@/lib/cn";

const ICONS8 = [
  "https://img.icons8.com/color/96/no-hidden-fee.png",
  "https://img.icons8.com/color/96/movie-projector.png",
  "https://img.icons8.com/color/96/telegram-app--v1.png",
  "https://img.icons8.com/color/96/security-checked--v1.png",
  "https://img.icons8.com/color/96/calendar--v1.png",
  "https://img.icons8.com/color/96/new-message.png",
  "https://img.icons8.com/color/96/price-tag.png",
];
const PRIMARY_INDEX = 2;

export default function WhyVmcSection() {
  const primary = WHY_VMC_ITEMS[PRIMARY_INDEX];
  const supporting = WHY_VMC_ITEMS.filter((_, index) => index !== PRIMARY_INDEX);

  return (
    <section className="border-t border-white/[0.07] px-4 py-20 sm:px-6 sm:py-24 lg:px-10">
      <div className="mx-auto max-w-screen-2xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="grid gap-5 border-b border-white/[0.08] pb-9 md:grid-cols-[minmax(0,0.8fr)_minmax(22rem,1.2fr)] md:items-end md:gap-12"
        >
          <div>
            <p className="eyebrow-pill text-[10px]">Why choose VMC?</p>
            <h2
              className="mt-4 text-[1.8rem] font-semibold leading-[1.08] text-white sm:text-4xl"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
            >
              The movie, without the maze.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
            VMC is a clean movie and series catalogue with verified Telegram delivery. You see the
            access type before you tap, and you never fight through adverts or fake download buttons.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-70px" }}
            transition={{ duration: 0.75, ease: [0.32, 0.72, 0, 1] }}
            className="relative overflow-hidden border-b border-white/[0.08] py-10 lg:border-b-0 lg:border-r lg:py-14 lg:pr-12"
          >
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/[0.06] ring-1 ring-white/[0.09] shadow-[0_18px_45px_rgba(52,211,153,0.15)]">
              <Image
                src={ICONS8[PRIMARY_INDEX]}
                alt="Telegram delivery"
                width={42}
                height={42}
                className="h-11 w-11 object-contain"
              />
            </span>
            <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300">
              The core promise
            </p>
            <h3 className="mt-3 max-w-lg text-2xl font-bold leading-tight text-white sm:text-3xl">
              {primary.title}
            </h3>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/58 sm:text-base">{primary.body}</p>

            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              {["Open a title", "Tap download", "Receive in Telegram"].map((label, index) => (
                <div key={label} className="flex items-center gap-2 border-t border-emerald-300/20 pt-3">
                  <span className="text-[10px] font-extrabold text-emerald-300">0{index + 1}</span>
                  <span className="text-xs font-semibold text-white/65">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:pl-12">
            {supporting.map((item, index) => {
              const originalIndex = WHY_VMC_ITEMS.indexOf(item);
              const iconUrl = ICONS8[originalIndex];
              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.55, delay: index * 0.05, ease: [0.32, 0.72, 0, 1] }}
                  className={cn(
                    "border-b border-white/[0.07] py-7 sm:px-6 sm:py-8 sm:odd:border-r",
                    index >= 4 && "lg:border-b-0",
                  )}
                >
                  <div className="flex items-start gap-4 sm:gap-5">
                    <span className="mt-0.5 grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/[0.055] ring-1 ring-white/[0.08]">
                      <Image
                        src={iconUrl}
                        alt=""
                        width={34}
                        height={34}
                        className="h-[34px] w-[34px] object-contain"
                      />
                    </span>
                    <div>
                      <h3 className="text-base font-bold leading-snug text-white sm:text-[17px]">{item.title}</h3>
                      <p className="mt-2 text-[15px] leading-7 text-white/60">{item.body}</p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-5 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2 text-sm text-white/52">
            <CheckCircle className="h-4 w-4 text-emerald-300" weight="fill" />
            Browse freely. Create an account only when you are ready to download.
          </p>
          <Link href="/get-access" className="group inline-flex items-center gap-2 text-sm font-bold text-emerald-300 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-emerald-200">
            Compare Premium plans
            <ArrowRight className="h-4 w-4 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1" weight="bold" />
          </Link>
        </div>
      </div>
    </section>
  );
}
