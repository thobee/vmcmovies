"use client";

import { useEffect, useState } from "react";
import { CircleNotch, FilmStrip, Television, X } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { useSiteToast } from "@/components/ui/SiteToast";
import type { TitleRequestType } from "@/lib/requests/types";

export default function RequestModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const toast = useSiteToast();
  const [title, setTitle] = useState("");
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
    <div className="fixed inset-0 z-[130] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-title"
        className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-[#101214] p-6 shadow-2xl sm:p-7"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-white/40 transition hover:bg-white/5 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" weight="bold" />
        </button>

        <h2
          id="request-title"
          className="pr-8 text-xl font-bold text-white"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
        >
          Request a title
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Tell us what movie or series you want added. Premium members only.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
              Type
            </label>
            <div className="flex gap-2">
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
                    "flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition",
                    type === id
                      ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-300"
                      : "border-white/10 bg-white/3 text-white/55 hover:border-white/20",
                  )}
                >
                  <Icon className="h-4 w-4" weight="bold" />
                  {label}
                </button>
              ))}
            </div>
          </div>

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
              className="auth-field w-full rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="request-year" className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
              Year <span className="normal-case tracking-normal text-white/30">(optional)</span>
            </label>
            <input
              id="request-year"
              type="number"
              inputMode="numeric"
              min={1900}
              max={new Date().getFullYear() + 2}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 2010"
              className="auth-field w-full rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none"
            />
          </div>

          {error && <p className="text-xs text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={pending || title.trim().length < 2}
            className={cn(
              "auth-btn w-full gap-2 py-3.5 text-sm",
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
  );
}
