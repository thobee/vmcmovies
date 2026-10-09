"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowSquareOut,
  CaretDown,
  Check,
  DeviceMobile,
  DownloadSimple,
  EyeSlash,
  Lock,
  Robot,
  Sparkle,
} from "@phosphor-icons/react";
import type { ContentAccessKind, DownloadFile, Season } from "@/lib/catalog/types";
import type { PremiumSource } from "@/lib/auth/types";
import { seasonLabel } from "@/lib/catalog/series";
import { getTelegramBotUrl } from "@/lib/catalog/telegram";
import { cn } from "@/lib/cn";
import { Arc } from "@/components/loading-ui/arc";
import TelegramIcon from "@/components/brand/TelegramIcon";

const PANEL_SHELL =
  "w-full max-w-xl rounded-[22px] border border-white/10 bg-[#101214]/95 p-4 shadow-[0_18px_52px_rgba(0,0,0,0.35)] sm:rounded-[26px] sm:p-6";
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
  additionalFiles?: DownloadFile[];
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
  additionalFiles,
}: DownloadPanelProps) {
  const router = useRouter();
  const [activatingTrial, setActivatingTrial] = useState(false);
  const [trialError, setTrialError] = useState("");
  const botUrl = getTelegramBotUrl();
  const seasonLinks = seasons?.filter((s) => s.downloadUrl.trim() || s.zipUrl || s.episodes?.length) ?? [];
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
            Create an account first. Then VMC sends your download through Telegram.
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
          botUrl={botUrl}
          movieDownloadUrl={movieDownloadUrl}
          seasons={seasonLinks}
          additionalFiles={additionalFiles}
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
                Open the bot and tap Start. Then return here to download once your payment is confirmed.
              </p>
            </div>
          </div>
          <a
            href={botUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-200"
          >
            <Robot className="h-4 w-4" weight="duotone" />
            Open bot
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
                Choose Premium to download
              </h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/60">
            Premium lets the VMC bot send this title directly to your Telegram.
          </p>
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
  botUrl,
  movieDownloadUrl,
  seasons,
  additionalFiles = [],
}: {
  accessKind: ContentAccessKind;
  premiumSource: PremiumSource | null;
  botUrl: string;
  movieDownloadUrl?: string;
  seasons: Season[];
  additionalFiles?: DownloadFile[];
}) {
  const [localSetup, setLocalSetup] = useState<TelegramSetupState | null>(null);
  const [botOpened, setBotOpened] = useState(false);
  const savedSetup = useSyncExternalStore(
    subscribeTelegramSetup,
    readTelegramSetup,
    serverTelegramSetup,
  );
  const setupState = localSetup ?? savedSetup;
  const setupHidden = setupState === "hidden";
  const downloadsReady = setupState !== "new";
  const updateSetup = (value: "complete" | "hidden") => {
    setLocalSetup(value);
    saveTelegramSetup(value);
  };

  const heading =
    accessKind === "free" || accessKind === "temporary_free"
      ? "Download with Telegram"
      : premiumSource === "trial"
          ? "Your trial is active"
          : "Ready to download";

  return (
    <section id="download" className={cn(PANEL_SHELL, "relative overflow-hidden ring-1 ring-emerald-400/15")}>
      <div aria-hidden className="absolute inset-x-5 top-0 h-px bg-emerald-300/50 sm:inset-x-6" />
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-400/[0.08] text-emerald-300 ring-1 ring-inset ring-emerald-300/15">
          <DownloadSimple className="size-[18px]" weight="light" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-white">{heading}</h2>
          <p className="mt-1 text-sm leading-5 text-white/60">
            First time only: tap Start in the VMC bot, then come back and choose a file.
          </p>
        </div>
      </div>

      {!setupHidden ? (
        <div id="telegram-setup" className="mt-5 scroll-mt-28 border-t border-white/10 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-white/65 ring-1 ring-inset ring-white/[0.08]">
                <Robot className="size-[18px]" weight="light" />
              </span>
              <div>
                <p className="text-xs font-semibold text-sky-300">First-time setup</p>
                <h3 className="mt-1 text-base font-bold text-white">Two quick steps</h3>
              </div>
            </div>
            {downloadsReady && (
              <button type="button" onClick={() => updateSetup("hidden")}
                className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-white/60 hover:text-white">
                <EyeSlash className="size-4" /> Hide steps
              </button>
            )}
          </div>

          <ol className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 sm:p-4">
            <li className="relative flex gap-3 pb-4">
              <span aria-hidden className="absolute bottom-0 left-[15px] top-9 w-px bg-sky-300/20" />
              <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-400/15 text-sm font-bold text-sky-300 ring-1 ring-sky-300/25">1</span>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-white">Open VMC bot and tap Start</h4>
                <p className="mt-1 text-sm leading-5 text-white/65">Telegram needs this before it can send files to you.</p>
                <a href={botUrl} target="_blank" rel="noopener noreferrer"
                  onClick={() => setBotOpened(true)}
                  className="group mt-3 flex min-h-11 w-full items-center gap-3 rounded-full bg-[#2AABEE] py-2 pl-4 pr-2 text-sm font-bold text-black transition hover:bg-sky-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300 active:scale-[0.99]">
                  <TelegramIcon className="size-5 shrink-0" /> Open VMC bot
                  <span className="ml-auto flex size-9 shrink-0 items-center justify-center rounded-full bg-black/10">
                    <ArrowSquareOut className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" weight="bold" />
                  </span>
                </a>
                <p className="mt-2 text-xs leading-5 text-white/45">Telegram opens in a new tab. Return here when you are done.</p>
              </div>
            </li>
            <li className="flex gap-3 pt-1">
              <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-1", downloadsReady ? "bg-emerald-400/15 text-emerald-300 ring-emerald-300/30" : "bg-white/5 text-white/70 ring-white/15")}>
                {downloadsReady ? <Check className="size-4" weight="bold" /> : "2"}
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-white">Confirm you are back</h4>
                <p className="mt-1 text-sm leading-5 text-white/65">Then choose this movie, season, or episode below.</p>
              </div>
            </li>
          </ol>

          <div className="mt-4 border-t border-white/10 pt-3">
            {downloadsReady ? (
              <p role="status" className="flex items-center gap-2 py-2 text-sm text-emerald-300">
                <Check className="size-4" weight="bold" />
                Setup complete. Choose a file below.
              </p>
            ) : (
              <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg bg-white/[0.04] px-3 py-3 text-sm font-medium text-white/85 transition hover:bg-white/[0.07] focus-within:ring-2 focus-within:ring-sky-300">
                <input type="checkbox" checked={false} onChange={() => updateSetup("hidden")}
                  className="size-5 shrink-0 accent-emerald-400" />
                I tapped Start in the VMC bot
              </label>
            )}
          </div>
          {botOpened && !downloadsReady && (
            <p role="status" className="mt-3 text-sm leading-5 text-sky-200">Back from Telegram? Tick the box after tapping Start.</p>
          )}
        </div>
      ) : (
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/[0.08] text-emerald-300 ring-1 ring-inset ring-emerald-300/15">
              <Check className="size-4" weight="bold" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Telegram is ready</p>
              <p className="mt-0.5 text-xs text-white/50">Choose a file to continue.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => updateSetup("complete")}
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-2 text-sm font-semibold text-sky-300 transition hover:bg-sky-400/10 hover:text-sky-200"
          >
            Review setup <CaretDown className="size-4" weight="bold" />
          </button>
        </div>
      )}

      {(movieDownloadUrl || seasons.length > 0 || additionalFiles.length > 0) && (
        <details className="group mt-5 border-y border-white/[0.08]">
          <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 py-2.5 marker:content-none">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-white/60 ring-1 ring-inset ring-white/[0.08]">
              <DeviceMobile className="size-[18px]" weight="light" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-white">Choose the right file</span>
              <span className="mt-0.5 block text-xs leading-5 text-white/50">Check quality and size before downloading.</span>
            </span>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-white/55 ring-1 ring-inset ring-white/[0.08] transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-open:bg-emerald-400/10 group-open:text-emerald-300">
              <CaretDown className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-open:rotate-180" weight="bold" />
            </span>
          </summary>
          <div className="pb-4 pl-[52px] pr-1">
            <p className="text-xs leading-5 text-white/60">
              Pick what fits your phone, storage, and data. Higher quality usually means a larger file.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
              <span className="rounded-lg bg-white/[0.04] px-2.5 py-2 text-white/65"><strong className="block text-white">480p</strong>Smallest file</span>
              <span className="rounded-lg bg-white/[0.04] px-2.5 py-2 text-white/65"><strong className="block text-white">720p</strong>Balanced</span>
              <span className="rounded-lg bg-white/[0.04] px-2.5 py-2 text-white/65"><strong className="block text-white">1080p / 2K</strong>Sharper, larger</span>
              <span className="rounded-lg bg-white/[0.04] px-2.5 py-2 text-white/65 sm:col-span-3"><strong className="block text-white">ZIP file</strong>Usually contains a full season or file pack.</span>
            </div>
          </div>
        </details>
      )}

      {movieDownloadUrl && (
        <div className="mt-5">
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
              Finish step 1 to continue
            </a>
          )}
        </div>
      )}

      {seasons.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-semibold text-white/70">Choose a season</h3>
          {seasons.map(season => (
            <details key={season.seasonNumber} open={seasons.length === 1} className="border-b border-white/10 pb-3">
              <summary className="cursor-pointer py-3 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-emerald-300">
                {seasonLabel(season)}
                {season.status && <span className={cn("ml-2 inline-block text-xs font-semibold", season.status === "completed" ? "text-emerald-300" : "text-amber-300")}>· {season.status === "completed" ? "Completed" : "Ongoing"}</span>}
                {season.episodes?.length ? <span className="mt-1 block text-xs font-normal text-white/55">{season.episodes.length} {season.episodes.length === 1 ? "episode" : "episodes"} available</span> : null}
              </summary>
              <div className="grid gap-2 pt-2">
                {season.downloadUrl && <FileLink label="Download season" url={season.downloadUrl} ready={downloadsReady} />}
                {season.zipUrl && <FileLink label="Download full season ZIP" url={season.zipUrl} ready={downloadsReady} />}
                {[...(season.episodes ?? [])].sort((a, b) => a.episodeNumber - b.episodeNumber).map(ep => (
                  <FileLink key={ep.episodeNumber} label={`Episode ${ep.episodeNumber}${ep.title ? ` - ${ep.title}` : ""}`} url={ep.downloadUrl} ready={downloadsReady} />
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
      {additionalFiles.length > 0 && (
        <div className="mt-6 space-y-2">
          <h3 className="mb-3 text-sm font-semibold text-white/70">Additional files</h3>
          {additionalFiles.map((file, index) => (
            <FileLink key={index} label={file.label} detail={[file.quality, file.fileSize].filter(Boolean).join(" / ")} url={file.downloadUrl} ready={downloadsReady} />
          ))}
        </div>
      )}
    </section>
  );
}

function FileLink({ label, detail, url, ready }: { label: string; detail?: string; url: string; ready: boolean }) {
  return (
    <a href={ready ? url : "#telegram-setup"} target={ready ? "_blank" : undefined} rel={ready ? "noopener noreferrer" : undefined}
      className="flex min-h-12 items-center justify-between gap-3 rounded-lg bg-white/[0.04] px-4 py-3 text-sm text-white/85 transition hover:bg-emerald-400/10 focus-visible:outline-2 focus-visible:outline-emerald-300">
      <span className="min-w-0 break-words"><span className="font-semibold">{label}</span>{detail && <span className="mt-1 block text-xs text-white/55">{detail}</span>}{!ready && <span className="mt-1 block text-xs text-white/55">Finish setup to open</span>}</span>
      {ready ? <DownloadSimple className="size-5 shrink-0 text-emerald-300" /> : <Lock className="size-4 shrink-0 text-white/50" />}
    </a>
  );
}
