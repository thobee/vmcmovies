"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Broadcast,
  CheckCircle,
  DownloadSimple,
  Eye,
  EyeSlash,
  Lock,
  Robot,
} from "@phosphor-icons/react";
import type { Season } from "@/lib/catalog/types";
import { seasonLabel } from "@/lib/catalog/series";
import {
  getTelegramBotUrl,
  getTelegramChannelUrl,
} from "@/lib/catalog/telegram";
import TelegramIcon from "@/components/brand/TelegramIcon";
import { cn } from "@/lib/cn";

const GUIDE_KEY = "vmc_tg_guide_done";

const PANEL_SHELL =
  "w-full max-w-xl rounded-[28px] border border-white/10 bg-[#101214]/95 p-5 shadow-[0_18px_52px_rgba(0,0,0,0.35)] sm:p-6";
const BTN_PRIMARY = "auth-btn w-full gap-2 px-6 py-3 text-sm sm:w-auto sm:min-w-[11.5rem]";
const BTN_SECONDARY =
  "inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.08] active:scale-[0.98] sm:w-auto sm:min-w-[7.5rem]";
const BTN_GUIDE_CHANNEL =
  "inline-flex w-full items-center justify-center gap-2.5 rounded-2xl border border-[#2AABEE]/50 bg-[#2AABEE]/15 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#2AABEE]/25 sm:w-auto";
const BTN_GUIDE_BOT =
  "inline-flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/[0.08] sm:w-auto";

interface DownloadPanelProps {
  premiumStatus?: "none" | "active" | "expired" | "pending";
  loggedIn?: boolean;
  movieDownloadUrl?: string;
  seasons?: Season[];
}

export default function DownloadPanel({
  premiumStatus = "none",
  loggedIn = false,
  movieDownloadUrl,
  seasons,
}: DownloadPanelProps) {
  const channelUrl = getTelegramChannelUrl();
  const botUrl = getTelegramBotUrl();
  const seasonLinks = seasons?.filter((s) => s.downloadUrl.trim()) ?? [];

  return (
    <>
      {premiumStatus === "active" ? (
        <PremiumDownloadPanel
          channelUrl={channelUrl}
          botUrl={botUrl}
          movieDownloadUrl={movieDownloadUrl}
          seasons={seasonLinks}
        />
      ) : premiumStatus === "pending" ? (
        <section id="download" className={PANEL_SHELL}>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400/12 text-amber-200 ring-1 ring-amber-300/20">
              <Lock className="h-5 w-5" weight="bold" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-amber-200">
                Payment pending
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Your premium download opens as soon as Paystack confirms the payment.
                Join the Telegram channel now so the file can arrive smoothly.
              </p>
            </div>
          </div>
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-200"
          >
            <Broadcast className="h-3.5 w-3.5" weight="bold" />
            Join channel
          </a>
          <button
            disabled
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/5 px-5 py-3 text-sm font-semibold text-white/35 sm:w-auto"
          >
            <Lock className="h-4 w-4" weight="bold" />
            Download (pending)
          </button>
        </section>
      ) : (
        <section id="download" className={PANEL_SHELL}>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-300 ring-1 ring-emerald-400/20">
              <Lock className="h-5 w-5" weight="bold" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
                Premium download
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                {loggedIn
                  ? "Browse is free. Premium unlocks Telegram delivery for every available title."
                  : "Browse is free. Log in, get premium, then download through Telegram."}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 text-xs text-white/52 sm:grid-cols-3">
            {["Secure checkout", "Telegram delivery", "No auto-renewal"].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2"
              >
                <CheckCircle className="h-3.5 w-3.5 text-emerald-300" weight="fill" />
                {item}
              </span>
            ))}
          </div>
          <div className="mt-5 flex flex-col items-stretch gap-2.5 sm:flex-row sm:flex-wrap">
            {!loggedIn && (
              <Link href="/login" className={BTN_SECONDARY}>
                Log in
              </Link>
            )}
            <Link href="/get-access" className={BTN_PRIMARY}>
              Get premium
            </Link>
            {loggedIn && (
              <Link href="/support?category=download" className={BTN_SECONDARY}>
                Need help?
              </Link>
            )}
          </div>
        </section>
      )}

      <StickyCta
        premiumStatus={premiumStatus}
        loggedIn={loggedIn}
        movieDownloadUrl={movieDownloadUrl}
        hasSeasons={seasonLinks.length > 0}
      />
    </>
  );
}

function StickyCta({
  premiumStatus,
  loggedIn,
  movieDownloadUrl,
  hasSeasons,
}: {
  premiumStatus: DownloadPanelProps["premiumStatus"];
  loggedIn: boolean;
  movieDownloadUrl?: string;
  hasSeasons: boolean;
}) {
  const href =
    premiumStatus === "active" && movieDownloadUrl
      ? movieDownloadUrl
      : premiumStatus === "active" && hasSeasons
        ? "#download"
        : "/get-access";

  const label =
    premiumStatus === "active" && movieDownloadUrl
      ? "Download"
      : premiumStatus === "active" && hasSeasons
        ? "Download a season"
        : premiumStatus === "pending"
          ? "Payment pending"
          : loggedIn
            ? "Get premium"
            : "Get premium";

  const external = premiumStatus === "active" && !!movieDownloadUrl;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/90 px-4 pt-3 backdrop-blur-xl lg:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={cn(
          "auth-btn w-full gap-2 py-3.5 text-sm",
          premiumStatus === "pending" && "pointer-events-none opacity-50",
        )}
      >
        {premiumStatus === "active" ? <DownloadSimple className="h-4 w-4" weight="bold" /> : <Lock className="h-4 w-4" weight="bold" />}
        {label}
      </a>
    </div>
  );
}

function PremiumDownloadPanel({
  channelUrl,
  botUrl,
  movieDownloadUrl,
  seasons,
}: {
  channelUrl: string;
  botUrl: string;
  movieDownloadUrl?: string;
  seasons: Season[];
}) {
  const [guideOpen, setGuideOpen] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setGuideOpen(localStorage.getItem(GUIDE_KEY) !== "1");
    } catch {
      setGuideOpen(true);
    }
  }, []);

  const hideGuide = () => {
    try {
      localStorage.setItem(GUIDE_KEY, "1");
    } catch {
      /* ignore */
    }
    setGuideOpen(false);
  };

  const showGuide = () => {
    try {
      localStorage.removeItem(GUIDE_KEY);
    } catch {
      /* ignore */
    }
    setGuideOpen(true);
  };

  return (
    <section id="download" className={cn(PANEL_SHELL, "ring-1 ring-emerald-400/20")}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">
            Download unlocked
          </h2>
          <p className="mt-1.5 text-sm text-white/60">
            Choose your file below. Telegram will open in a new tab.
          </p>
        </div>
        {guideOpen !== null && (
          <button
            type="button"
            onClick={guideOpen ? hideGuide : showGuide}
            aria-label={guideOpen ? "Hide setup guide" : "Show setup guide"}
            className={cn(
              "inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
              guideOpen
                ? "border-white/12 bg-white/[0.04] text-white/50"
                : "border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
            )}
          >
            {guideOpen ? (
              <>
                <EyeSlash className="h-3 w-3" weight="bold" />
                Hide
              </>
            ) : (
              <>
                <Eye className="h-3 w-3" weight="bold" />
                Guide
              </>
            )}
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {guideOpen && (
          <motion.div
            key="guide"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              <p className="text-sm leading-6 text-white/70">
                First time? Join the channel and open the bot once, then tap download.
                Use the <span className="font-medium text-white">same Telegram account</span> from
                signup.
              </p>

              <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                <a
                  href={channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={BTN_GUIDE_CHANNEL}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2AABEE] text-[10px] font-bold text-white">
                    1
                  </span>
                  <TelegramIcon className="h-5 w-5 shrink-0 text-[#2AABEE]" />
                  Join channel
                </a>
                <a
                  href={botUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={BTN_GUIDE_BOT}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold text-white">
                    2
                  </span>
                  <Robot className="h-5 w-5 shrink-0" weight="bold" />
                  Open bot &amp; Start
                </a>
              </div>

              <p className="text-xs leading-5 text-white/45">
                After download, Telegram opens and the bot sends the file. If nothing arrives, check
                channel join, Start, and the same account.
              </p>

              <button
                type="button"
                onClick={hideGuide}
                className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-white/45 hover:text-white/80"
              >
                <EyeSlash className="h-3 w-3" weight="bold" />
                Don&apos;t show again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {movieDownloadUrl && (
          <div className="mt-5 rounded-3xl border border-emerald-400/18 bg-emerald-500/[0.06] p-3">
          <a
            href={movieDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
              className={cn(BTN_PRIMARY, "sm:w-full")}
          >
            <DownloadSimple className="h-4 w-4" weight="bold" />
              Download movie
          </a>
        </div>
      )}

      {seasons.length > 0 && (
        <div className="mt-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
            Available seasons
          </p>
          <div className="grid gap-2">
            {seasons.map((season) => (
              <a
                key={season.seasonNumber}
                href={season.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm font-bold text-white transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
              >
                <span>{seasonLabel(season)}</span>
                <DownloadSimple className="h-4 w-4 shrink-0 text-emerald-400" weight="bold" />
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
