"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowSquareOut,
  Broadcast,
  Check,
  DownloadSimple,
  EyeSlash,
  Lock,
  Robot,
  Sparkle,
} from "@phosphor-icons/react";
import type { ContentAccessKind, Season } from "@/lib/catalog/types";
import type { PremiumSource } from "@/lib/auth/types";
import { seasonLabel } from "@/lib/catalog/series";
import { getTelegramBotUrl, getTelegramChannelUrl } from "@/lib/catalog/telegram";
import { cn } from "@/lib/cn";
import { Arc } from "@/components/loading-ui/arc";
import TelegramIcon from "@/components/brand/TelegramIcon";

const PANEL_SHELL =
  "w-full max-w-xl rounded-[28px] border border-white/10 bg-[#101214]/95 p-5 shadow-[0_18px_52px_rgba(0,0,0,0.35)] sm:p-6";
const BTN_PRIMARY = "auth-btn w-full gap-2 px-6 py-3 text-sm sm:w-auto sm:min-w-[11.5rem]";
const BTN_SECONDARY =
  "inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.08] active:scale-[0.98] sm:w-auto sm:min-w-[7.5rem]";
const TELEGRAM_SETUP_KEY = "vmc_telegram_download_setup_v1";
const TELEGRAM_SETUP_EVENT = "vmc:telegram-download-setup";

type TelegramSetupState = "new" | "complete" | "hidden";

function readTelegramSetup(): TelegramSetupState {
  try {
    const saved = localStorage.getItem(TELEGRAM_SETUP_KEY);
    return saved === "complete" || saved === "hidden" ? saved : "new";
  } catch {
    return "new";
  }
}

function subscribeTelegramSetup(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(TELEGRAM_SETUP_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(TELEGRAM_SETUP_EVENT, onChange);
  };
}

function saveTelegramSetup(value: Exclude<TelegramSetupState, "new">) {
  try {
    localStorage.setItem(TELEGRAM_SETUP_KEY, value);
  } catch {
    // The current page can still update when browser storage is unavailable.
  }
  window.dispatchEvent(new Event(TELEGRAM_SETUP_EVENT));
}

function serverTelegramSetup(): TelegramSetupState {
  return "new";
}
interface DownloadPanelProps {
  premiumStatus?: "none" | "active" | "expired" | "pending";
  premiumSource?: PremiumSource | null;
  accessKind?: ContentAccessKind;
  trialEligible?: boolean;
  trialDays?: number;
  loggedIn?: boolean;
  movieDownloadUrl?: string;
  seasons?: Season[];
}

export default function DownloadPanel({
  premiumStatus = "none",
  premiumSource = null,
  accessKind = "premium",
  trialEligible = false,
  trialDays = 7,
  loggedIn = false,
  movieDownloadUrl,
  seasons,
}: DownloadPanelProps) {
  const router = useRouter();
  const [activatingTrial, setActivatingTrial] = useState(false);
  const [trialError, setTrialError] = useState("");
  const channelUrl = getTelegramChannelUrl();
  const botUrl = getTelegramBotUrl();
  const seasonLinks = seasons?.filter((s) => s.downloadUrl.trim()) ?? [];
  const unlocked =
    loggedIn && (accessKind !== "premium" || premiumStatus === "active");

  const activateTrial = async () => {
    setActivatingTrial(true);
    setTrialError("");
    try {
      const response = await fetch("/api/trial/activate", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setTrialError(data.error ?? "Could not activate welcome access");
        return;
      }
      router.refresh();
    } catch {
      setTrialError("Network error. Please try again.");
    } finally {
      setActivatingTrial(false);
    }
  };

  return (
    <>
      {!loggedIn ? (
        <section id="download" className={PANEL_SHELL}>
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 text-black shadow-[0_10px_28px_rgba(52,211,153,0.18)]">
              <Lock className="h-5 w-5" weight="fill" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                Account required
              </p>
              <h2
                className="mt-1 text-xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
              >
                Sign up to download
              </h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/60">
            Create an account to download this movie.
          </p>
          <div className="mt-5 flex flex-col items-stretch gap-2.5 border-t border-white/[0.07] pt-5 sm:flex-row">
            <Link href="/signup" className={BTN_PRIMARY}>
              Create account
            </Link>
            <Link href="/login" className={BTN_SECONDARY}>
              Log in
            </Link>
          </div>
        </section>
      ) : unlocked ? (
        <PremiumDownloadPanel
          accessKind={accessKind}
          premiumSource={premiumSource}
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
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 text-black shadow-[0_10px_28px_rgba(52,211,153,0.18)]">
              <Lock className="h-5 w-5" weight="fill" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                Premium required
              </p>
              <h2
                className="mt-1 text-xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
              >
                Unlock this download
              </h2>
            </div>
          </div>
          <div className="mt-5 flex flex-col items-stretch gap-2.5 border-t border-white/[0.07] pt-5 sm:flex-row sm:flex-wrap">
            {loggedIn && trialEligible ? (
              <button
                type="button"
                onClick={() => void activateTrial()}
                disabled={activatingTrial}
                className={cn(BTN_PRIMARY, "bg-sky-400 hover:bg-sky-300")}
              >
                {activatingTrial ? <Arc className="size-4" /> : <Sparkle className="h-4 w-4" weight="fill" />}
                {activatingTrial ? "Activating..." : `Start ${trialDays}-day free access`}
              </button>
            ) : (
              <Link href="/get-access" className={BTN_PRIMARY}>
                Get premium
              </Link>
            )}
            {loggedIn && (
              <Link href="/support?category=download" className={BTN_SECONDARY}>
                Need help?
              </Link>
            )}
          </div>
          {trialError && <p className="mt-3 text-sm text-red-300">{trialError}</p>}
        </section>
      )}

    </>
  );
}

function PremiumDownloadPanel({
  accessKind,
  premiumSource,
  channelUrl,
  botUrl,
  movieDownloadUrl,
  seasons,
}: {
  accessKind: ContentAccessKind;
  premiumSource: PremiumSource | null;
  channelUrl: string;
  botUrl: string;
  movieDownloadUrl?: string;
  seasons: Season[];
}) {
  const [channelOpened, setChannelOpened] = useState(false);
  const [botOpened, setBotOpened] = useState(false);
  const setupState = useSyncExternalStore(
    subscribeTelegramSetup,
    readTelegramSetup,
    serverTelegramSetup,
  );
  const setupHidden = setupState === "hidden";
  const setupComplete = setupState === "complete";
  const channelDone = channelOpened || setupComplete;
  const botDone = botOpened || setupComplete;

  const markSetupStep = (step: "channel" | "bot") => {
    const nextChannel = channelDone || step === "channel";
    const nextBot = botDone || step === "bot";
    setChannelOpened(nextChannel);
    setBotOpened(nextBot);
    if (nextChannel && nextBot) {
      saveTelegramSetup("complete");
    }
  };

  const hideSetup = () => {
    saveTelegramSetup("hidden");
  };

  const showSetup = () => {
    saveTelegramSetup("complete");
  };

  const downloadsReady = setupHidden || setupComplete || (channelOpened && botOpened);
  const heading =
    accessKind === "free" || accessKind === "temporary_free"
      ? "Free download"
      : premiumSource === "trial"
          ? "Welcome access active"
          : "Download unlocked";

  return (
    <section id="download" className={cn(PANEL_SHELL, "ring-1 ring-emerald-400/20")}>
      <div>
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">
          {heading}
        </h2>
        <p className="mt-1.5 text-sm text-white/60">
          Choose your file below. Telegram will open in a new tab.
        </p>
      </div>

      {!setupHidden && (
        <div
          id="telegram-setup"
          className="mt-5 rounded-[26px] bg-[#2AABEE]/[0.06] p-1.5 ring-1 ring-inset ring-[#2AABEE]/20"
        >
          <div className="rounded-[20px] bg-[#0b1114] p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#67c8f5]">
                  Required first-time setup
                </p>
                <h3 className="mt-1.5 text-base font-bold text-white">Prepare Telegram once</h3>
                <p className="mt-1 text-xs leading-5 text-white/45">
                  Open both steps before your download can begin.
                </p>
              </div>
              <button
                type="button"
                onClick={hideSetup}
                className="group inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-semibold text-white/42 ring-1 ring-inset ring-white/[0.08] transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.06] hover:text-white/75"
                aria-label="Hide Telegram setup because it is already complete"
              >
                <EyeSlash className="h-3.5 w-3.5" weight="bold" />
                Already set up? Hide
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => markSetupStep("channel")}
                className={cn(
                  "group flex min-h-[76px] items-center gap-3 rounded-2xl p-3.5 ring-1 ring-inset transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.985]",
                  channelDone
                    ? "bg-[#2AABEE]/14 ring-[#2AABEE]/30"
                    : "bg-white/[0.035] ring-white/[0.08] hover:bg-[#2AABEE]/10 hover:ring-[#2AABEE]/25",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    channelDone ? "bg-emerald-400 text-black" : "bg-[#2AABEE] text-white",
                  )}
                >
                  {channelDone ? <Check className="h-4 w-4" weight="bold" /> : "1"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-bold text-white">
                    <TelegramIcon className="h-5 w-5 text-[#2AABEE]" />
                    Join channel
                  </span>
                  <span className="mt-1 block text-[11px] text-white/38">
                    {channelDone ? "Channel opened" : "Get access to VMC updates"}
                  </span>
                </span>
                <ArrowSquareOut className="h-4 w-4 shrink-0 text-white/28 transition group-hover:text-[#67c8f5]" weight="bold" />
              </a>

              <a
                href={botUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => markSetupStep("bot")}
                className={cn(
                  "group flex min-h-[76px] items-center gap-3 rounded-2xl p-3.5 ring-1 ring-inset transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.985]",
                  botDone
                    ? "bg-emerald-400/[0.09] ring-emerald-300/25"
                    : "bg-white/[0.035] ring-white/[0.08] hover:bg-emerald-400/[0.07] hover:ring-emerald-300/20",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    botDone ? "bg-emerald-400 text-black" : "bg-white/[0.07] text-white",
                  )}
                >
                  {botDone ? <Check className="h-4 w-4" weight="bold" /> : "2"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-bold text-white">
                    <Robot className="h-5 w-5 text-emerald-300" weight="duotone" />
                    Open bot
                  </span>
                  <span className="mt-1 block text-[11px] text-white/38">
                    {botDone ? "Bot opened" : "Tap Start inside Telegram"}
                  </span>
                </span>
                <ArrowSquareOut className="h-4 w-4 shrink-0 text-white/28 transition group-hover:text-emerald-300" weight="bold" />
              </a>
            </div>

            <div className="mt-4 flex items-center gap-3 border-t border-white/[0.07] pt-4">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                  downloadsReady ? "bg-emerald-400 text-black" : "bg-white/[0.05] text-white/35",
                )}
              >
                {downloadsReady ? <Check className="h-4 w-4" weight="bold" /> : "3"}
              </span>
              <div>
                <p className={cn("text-xs font-bold", downloadsReady ? "text-emerald-300" : "text-white/55") }>
                  {downloadsReady ? "Telegram is ready" : "Download unlocks after steps 1 and 2"}
                </p>
                <p className="mt-0.5 text-[11px] text-white/32">You only need to complete this setup once.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {setupHidden && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#2AABEE]/[0.07] px-3.5 py-3 ring-1 ring-inset ring-[#2AABEE]/18">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2AABEE]/15 text-[#67c8f5]">
            <TelegramIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white">Telegram ready</p>
            <p className="mt-0.5 text-[11px] text-white/38">First-time setup is already complete.</p>
          </div>
          <button
            type="button"
            onClick={showSetup}
            className="shrink-0 rounded-full px-3 py-2 text-[11px] font-semibold text-[#67c8f5] ring-1 ring-inset ring-[#2AABEE]/20 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#2AABEE]/10 hover:text-white"
          >
            Show steps
          </button>
        </div>
      )}

      {movieDownloadUrl && (
        <div className="mt-4 rounded-3xl border border-emerald-400/18 bg-emerald-500/[0.06] p-3">
          {downloadsReady ? (
            <a
              href={movieDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(BTN_PRIMARY, "sm:w-full")}
            >
              <DownloadSimple className="h-4 w-4" weight="bold" />
              Download movie
            </a>
          ) : (
            <a
              href="#telegram-setup"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white/42 ring-1 ring-inset ring-white/[0.08]"
            >
              <Lock className="h-4 w-4" weight="bold" />
              Complete Telegram setup
            </a>
          )}
        </div>
      )}

      {seasons.length > 0 && (
        <div className="mt-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
            Available seasons
          </p>
          <div className="grid gap-2">
            {seasons.map((season) =>
              downloadsReady ? (
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
              ) : (
                <a
                  key={season.seasonNumber}
                  href="#telegram-setup"
                  className="inline-flex items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-black/20 px-4 py-3.5 text-sm font-bold text-white/38"
                >
                  <span>{seasonLabel(season)}</span>
                  <Lock className="h-4 w-4 shrink-0" weight="bold" />
                </a>
              ),
            )}
          </div>
        </div>
      )}
    </section>
  );
}
