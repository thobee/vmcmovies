"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  AndroidLogo,
  AppleLogo,
  ArrowSquareOut,
  Check,
  PlayCircle,
  Robot,
  X,
} from "@phosphor-icons/react";
import TelegramIcon from "@/components/brand/TelegramIcon";
import { cn } from "@/lib/cn";

type Platform = "iphone" | "android";

const GUIDES: Record<Platform, { title: string; steps: string[] }> = {
  iphone: {
    title: "Download on iPhone or iPad",
    steps: [
      "Open the VMC bot and tap Start once to activate it.",
      "Return to VMC, choose a movie or season, then tap Download.",
      "When Telegram opens, tap the download arrow on the file. You can watch there or save it to Files.",
    ],
  },
  android: {
    title: "Download on Android",
    steps: [
      "Open the VMC bot and tap Start once to activate it.",
      "Return to VMC, choose a movie or season, then tap Download.",
      "Telegram opens with the file. Tap the download arrow, then watch it or find it in Telegram downloads.",
    ],
  },
};

export default function TelegramDownloadTutorial({
  botUrl,
  className,
}: {
  botUrl: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>("iphone");
  const guide = GUIDES[platform];

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white/[0.045] px-5 text-sm font-semibold text-white/70 ring-1 ring-inset ring-white/10 transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.08] hover:text-white active:scale-[0.98] sm:w-auto",
          className,
        )}
      >
        <PlayCircle
          className="h-[18px] w-[18px] text-[#2AABEE] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110"
          weight="fill"
        />
        How to download
      </button>

      {open && createPortal(
        (
        <div className="fixed inset-0 z-[130] flex min-h-[100dvh] items-end justify-center overflow-y-auto px-3 pt-16 sm:items-center sm:px-6 sm:py-8">
          <button
            type="button"
            aria-label="Close Telegram download tutorial"
            className="fixed inset-0 bg-black/82 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="telegram-tutorial-title"
            className="relative w-full max-w-[38rem] rounded-t-[30px] bg-white/[0.05] p-1.5 shadow-[0_28px_100px_rgba(0,0,0,0.65)] ring-1 ring-inset ring-white/10 sm:rounded-[32px]"
          >
            <div className="relative max-h-[calc(100dvh-4rem)] overflow-y-auto rounded-t-[24px] bg-[#101416] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:max-h-[calc(100dvh-6rem)] sm:rounded-[26px]">
              <div className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-[#101416]/95 px-5 pb-4 pt-5 backdrop-blur-xl sm:px-7 sm:pt-7">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#2AABEE] text-white shadow-[0_12px_30px_rgba(42,171,238,0.2)]">
                    <PlayCircle className="h-6 w-6" weight="fill" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#67c8f5]">
                      Quick guide
                    </p>
                    <h2
                      id="telegram-tutorial-title"
                      className="mt-1 text-xl font-bold text-white sm:text-2xl"
                      style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
                    >
                      Download with Telegram
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close tutorial"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-white/45 ring-1 ring-inset ring-white/10 transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" weight="bold" />
                </button>
              </div>

              <div className="px-5 pb-6 sm:px-7 sm:pb-7">
                <div
                  className="grid grid-cols-2 gap-2 rounded-2xl bg-black/25 p-1.5 ring-1 ring-inset ring-white/[0.07]"
                  role="tablist"
                  aria-label="Choose your device"
                >
                  {(
                    [
                      { id: "iphone" as const, label: "iPhone / iPad", icon: AppleLogo },
                      { id: "android" as const, label: "Android", icon: AndroidLogo },
                    ] as const
                  ).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={platform === id}
                      onClick={() => setPlatform(id)}
                      className={cn(
                        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:text-sm",
                        platform === id
                          ? "bg-white text-black shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
                          : "text-white/50 hover:bg-white/[0.05] hover:text-white",
                      )}
                    >
                      <Icon className="h-4 w-4" weight="fill" />
                      {label}
                    </button>
                  ))}
                </div>

                <div className="mt-5 rounded-[24px] bg-white/[0.035] p-1.5 ring-1 ring-inset ring-white/[0.08]">
                  <div className="rounded-[18px] bg-black/20 px-4 py-5 sm:px-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                          {guide.steps.length} simple steps
                        </p>
                        <h3 className="mt-1.5 text-base font-bold text-white">{guide.title}</h3>
                      </div>
                      <TelegramIcon className="h-8 w-8 shrink-0 text-[#2AABEE]" />
                    </div>

                    <ol className="mt-5 space-y-4">
                      {guide.steps.map((step, index) => (
                        <li key={step} className="grid grid-cols-[2rem_1fr] gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2AABEE]/12 text-xs font-bold text-[#67c8f5] ring-1 ring-inset ring-[#2AABEE]/20">
                            {index + 1}
                          </span>
                          <p className="pt-1 text-sm leading-6 text-white/65">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="mt-5 grid gap-2.5">
                  <a
                    href={botUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex min-h-12 items-center justify-between rounded-full bg-white/[0.06] py-2 pl-5 pr-2 text-sm font-bold text-white ring-1 ring-inset ring-white/10 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/10 active:scale-[0.98]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Robot className="h-5 w-5 text-emerald-300" weight="duotone" /> Open bot
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.07]">
                      <ArrowSquareOut className="h-4 w-4" weight="bold" />
                    </span>
                  </a>
                </div>

                <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-white/38">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" weight="bold" />
                  Tap Start in the bot once, then return to the movie or series page and tap Download.
                </p>
              </div>
            </div>
          </div>
        </div>
        ),
        document.body,
      )}
    </>
  );
}
