"use client";

import { useEffect, useState } from "react";
import { CircleNotch, FilmStrip, Television, X } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { useSiteToast } from "@/components/ui/SiteToast";
import type { TitleRequestType } from "@/lib/requests/types";

export default function RequestModal({
  open,
  onClose,
  initialTitle = "",
}: {
  open: boolean;
  onClose: () => void;
  initialTitle?: string;
}) {
  const toast = useSiteToast();
  const [title, setTitle] = useState(initialTitle);
  const [type, setType] = useState<TitleRequestType>("movie");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const reset = () => {
    setTitle("");
    setType("movie");
    setYear("");
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type,
          year: year.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not send request");
        return;
      }
      toast({
        title: "Request sent",
        message: "We'll review your title request soon.",
      });
      handleClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[130] flex min-h-[100dvh] items-start justify-center overflow-y-auto px-4 pt-[14dvh] pb-6 sm:px-6 sm:pt-[16dvh]">
      <button
        type="button"
        aria-label="Close"
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-title"
        className="relative w-full max-w-[31rem] rounded-[2rem] border border-white/10 bg-white/[0.04] p-1.5 shadow-[0_24px_90px_rgba(0,0,0,0.55)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-8 -top-10 h-32 rounded-full bg-emerald-400/10 blur-3xl"
        />

        <div
          className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] border border-white/[0.08] bg-[#101214] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
        >
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/45 transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.08] hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" weight="bold" />
          </button>

          <div className="px-5 pt-6 pb-5 sm:px-7 sm:pt-7 sm:pb-6">
            <div className="mb-5 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
              Premium request
            </div>

            <h2
              id="request-title"
              className="pr-10 text-2xl font-bold leading-tight text-white sm:text-[1.7rem]"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
            >
              Request a title
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/58">
              Tell us the movie or series you want added. We review premium requests first.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className="mb-2.5 block text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                  Type
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {(
                    [
                      { id: "movie" as const, label: "Movie", icon: FilmStrip },
                      { id: "series" as const, label: "Series", icon: Television },
                    ] as const
                  ).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setType(id)}
                      className={cn(
                        "group flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]",
                        type === id
                          ? "border-emerald-400/45 bg-emerald-500/12 text-emerald-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                          : "border-white/10 bg-white/[0.035] text-white/55 hover:border-white/20 hover:bg-white/[0.06] hover:text-white/75",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105",
                          type === id ? "text-emerald-300" : "text-white/45",
                        )}
                        weight="bold"
                      />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
                <div>
                  <label htmlFor="request-name" className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                    Title
                  </label>
                  <input
                    id="request-name"
                    type="text"
                    required
                    maxLength={120}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Breaking Bad"
                    className="auth-field min-h-12 w-full rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="request-year" className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                    Year
                  </label>
                  <input
                    id="request-year"
                    type="number"
                    inputMode="numeric"
                    min={1900}
                    max={new Date().getFullYear() + 2}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="Optional"
                    className="auth-field min-h-12 w-full rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-200">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending || title.trim().length < 2}
                className={cn(
                  "auth-btn min-h-12 w-full gap-2 py-3.5 text-sm transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.99]",
                  pending && "cursor-not-allowed opacity-60",
                )}
              >
                {pending ? (
                  <>
                    <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
                    Sending…
                  </>
                ) : (
                  "Send request"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
