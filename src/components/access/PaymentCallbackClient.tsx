"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowsClockwise,
  ChatCircle,
  CheckCircle,
  CircleNotch,
  Copy,
  Crown,
  DownloadSimple,
  ShieldCheck,
  Sparkle,
  XCircle,
} from "@phosphor-icons/react";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/cn";

type Status = "loading" | "success" | "failed";

const WELCOME_SEEN_KEY = "vmc_welcome_premium_seen";

const LOADING_STEPS = [
  "Confirming payment",
  "Activating premium",
  "Finishing up",
] as const;

function shortRef(ref: string): string {
  if (ref.length <= 22) return ref;
  return `${ref.slice(0, 10)}…${ref.slice(-8)}`;
}

function ReferenceChip({
  reference,
  className,
}: {
  reference: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [reference]);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 sm:px-4",
        className,
      )}
    >
      <div className="min-w-0 flex-1 text-left">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
          Payment reference
        </p>
        <p
          className="mt-0.5 truncate font-mono text-xs text-white/85 sm:text-sm"
          title={reference}
        >
          <span className="hidden sm:inline">{reference}</span>
          <span className="sm:hidden">{shortRef(reference)}</span>
        </p>
      </div>
      <button
        type="button"
        onClick={() => void copy()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
        aria-label="Copy payment reference"
      >
        {copied ? (
          <CheckCircle className="h-4 w-4 text-emerald-400" weight="fill" />
        ) : (
          <Copy className="h-4 w-4" weight="bold" />
        )}
      </button>
    </div>
  );
}

export default function PaymentCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const checkoutId = searchParams.get("checkout_id");
  const { refresh } = useAuth();

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const [expiry, setExpiry] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (status !== "loading") return;
    setLoadingStep(0);
    const t1 = window.setTimeout(() => setLoadingStep(1), 2000);
    const t2 = window.setTimeout(() => setLoadingStep(2), 4500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [status, reference, checkoutId]);

  useEffect(() => {
    if (!reference && !checkoutId) {
      setStatus("failed");
      setMessage("No payment reference found in the link. Return to plans or contact support.");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        let lastError = "Payment could not be verified.";

        for (let attempt = 0; attempt < 4; attempt++) {
          const qs = new URLSearchParams();
          if (reference) qs.set("reference", reference);
          if (checkoutId) qs.set("checkout_id", checkoutId);
          const res = await fetch(`/api/payments/verify?${qs.toString()}`);
          const data = await res.json();
          if (cancelled) return;

          if (res.ok && data.status === "success") {
            const forYou = data.paidForYou !== false;
            setStatus("success");
            setMessage(
              !forYou
                ? "Payment confirmed. Log in with the account you paid with to use premium."
                : data.alreadyFulfilled
                  ? "Your premium access is already active."
                  : "Premium is on. Tap download on any movie or series — Telegram sends the file.",
            );
            setExpiry(forYou ? data.expiryDate ?? null : null);
            if (forYou) {
              await refresh();
              try {
                localStorage.removeItem(WELCOME_SEEN_KEY);
              } catch {
                /* ignore */
              }
              window.setTimeout(() => router.replace("/account?welcome=premium"), 2800);
            }
            return;
          }

          lastError =
            data.error ??
            (data.retryable
              ? "Still confirming. Hang on a few seconds…"
              : "Payment could not be verified.");

          if (!data.retryable && res.status !== 502 && res.status !== 503) break;
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
        }

        if (!cancelled) {
          setStatus("failed");
          setMessage(lastError);
        }
      } catch {
        if (!cancelled) {
          setStatus("failed");
          setMessage("Could not confirm yet. If you paid, refresh this page or contact support.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reference, checkoutId, refresh, router]);

  const supportHref = reference
    ? `/support?category=payment&ref=${encodeURIComponent(reference)}`
    : "/support?category=payment";

  const expiryLabel = expiry
    ? new Date(expiry).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const displayRef = reference ?? checkoutId ?? "";

  return (
    <div className="relative w-full max-w-lg">
      {/* ambient glow */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -inset-x-6 top-8 h-48 rounded-full blur-3xl",
          status === "success" && "bg-emerald-500/20",
          status === "failed" && "bg-red-500/15",
          status === "loading" && "bg-emerald-500/10",
        )}
      />

      <div
        className={cn(
          "relative overflow-hidden rounded-[24px] border bg-[#101214] sm:rounded-[28px]",
          status === "success" && "border-emerald-400/30",
          status === "failed" && "border-red-400/20",
          status === "loading" && "border-white/10",
        )}
      >
        <div
          aria-hidden
          className={cn(
            "h-1 w-full",
            status === "success" && "bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600",
            status === "failed" && "bg-gradient-to-r from-red-600/80 via-red-400/80 to-red-600/80",
            status === "loading" && "bg-gradient-to-r from-emerald-900 via-emerald-500 to-emerald-900 animate-pulse",
          )}
        />

        <div className="px-4 py-8 text-center sm:px-8 sm:py-10">
          <p className="mb-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400 sm:text-xs">
            <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4" weight="fill" />
            VMC Premium
          </p>

          {status === "loading" && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 sm:h-[4.5rem] sm:w-[4.5rem]">
                <CircleNotch className="h-8 w-8 animate-spin text-emerald-400" weight="bold" />
              </div>
              <h1
                className="text-2xl font-bold leading-tight text-white sm:text-3xl"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
              >
                Confirming payment
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/65">
                We&apos;re attaching premium to your account. Don&apos;t close this tab.
              </p>

              <ul className="mx-auto mt-6 max-w-xs space-y-2 text-left">
                {LOADING_STEPS.map((step, i) => {
                  const done = i < loadingStep;
                  const active = i === loadingStep;
                  return (
                    <li
                      key={step}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                        active && "bg-emerald-500/10 text-emerald-200",
                        done && !active && "text-white/50",
                        !done && !active && "text-white/35",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                          active && "border-emerald-400/50 bg-emerald-500/20",
                          done && "border-emerald-400/30 bg-emerald-500/10 text-emerald-400",
                          !done && !active && "border-white/15",
                        )}
                      >
                        {done ? <CheckCircle className="h-3.5 w-3.5" weight="fill" /> : i + 1}
                      </span>
                      {step}
                      {active && (
                        <CircleNotch className="ml-auto h-3.5 w-3.5 animate-spin text-emerald-400" weight="bold" />
                      )}
                    </li>
                  );
                })}
              </ul>

              {displayRef && (
                <ReferenceChip reference={displayRef} className="mt-6" />
              )}
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/25 sm:h-[4.5rem] sm:w-[4.5rem]">
                <Sparkle className="h-8 w-8 text-emerald-400" weight="fill" />
              </div>
              <h1
                className="text-2xl font-bold leading-tight text-white sm:text-3xl"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
              >
                You&apos;re in
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/70">{message}</p>

              {expiryLabel && (
                <div className="mx-auto mt-5 max-w-sm rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3.5">
                  <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-300/80">
                    <ShieldCheck className="h-4 w-4" weight="bold" />
                    Premium active
                  </p>
                  <p className="mt-1 text-base font-bold text-white sm:text-lg">
                    Until {expiryLabel}
                  </p>
                </div>
              )}

              {displayRef && <ReferenceChip reference={displayRef} className="mt-5" />}

              <p className="mt-4 text-xs text-white/40">Taking you to your account…</p>

              <ul className="mx-auto mt-5 max-w-sm space-y-2 text-left text-sm text-white/60">
                <li className="flex items-start gap-2.5">
                  <DownloadSimple className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" weight="bold" />
                  Open any title → tap Download → Telegram sends the file
                </li>
                <li className="flex items-start gap-2.5">
                  <ChatCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" weight="bold" />
                  Save your Telegram username on Account for deliveries
                </li>
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/movies" className="auth-btn min-h-12 flex-1 py-3.5 text-sm">
                  Browse movies
                </Link>
                <Link
                  href="/account?welcome=premium"
                  className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-white/12 bg-white/4 py-3.5 text-sm font-semibold text-white transition hover:bg-white/8"
                >
                  My account
                </Link>
              </div>
            </>
          )}

          {status === "failed" && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15 sm:h-[4.5rem] sm:w-[4.5rem]">
                <XCircle className="h-8 w-8 text-red-400" weight="fill" />
              </div>
              <h1
                className="text-2xl font-bold leading-tight text-white sm:text-3xl"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
              >
                Couldn&apos;t confirm yet
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/70">{message}</p>

              {displayRef && (
                <>
                  <ReferenceChip reference={displayRef} className="mt-5" />
                  <p className="mt-3 text-xs leading-5 text-white/45">
                    Paid already? Copy this reference and send it to support — we&apos;ll activate
                    your account manually.
                  </p>
                </>
              )}

              <div className="mt-8 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="auth-btn min-h-12 w-full gap-2 py-3.5 text-sm"
                >
                  <ArrowsClockwise className="h-4 w-4" weight="bold" />
                  Try again
                </button>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Link
                    href="/get-access"
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/4 py-3.5 text-sm font-semibold text-white transition hover:bg-white/8"
                  >
                    Back to plans
                  </Link>
                  <Link
                    href={supportHref}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/4 py-3.5 text-sm font-semibold text-white transition hover:bg-white/8"
                  >
                    Contact support
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
