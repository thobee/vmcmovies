"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/cn";
import type { SupportCategory } from "@/lib/support/types";
import HoneypotField from "@/components/security/HoneypotField";

const CATEGORIES: { value: SupportCategory; label: string }[] = [
  { value: "payment", label: "Payment" },
  { value: "download", label: "Download" },
  { value: "account", label: "Account" },
  { value: "other", label: "Other" },
];

interface SupportFormProps {
  loggedIn: boolean;
  email?: string;
  telegramUsername?: string;
}

export default function SupportForm({ loggedIn, email, telegramUsername }: SupportFormProps) {
  const searchParams = useSearchParams();
  const defaultCategory = (searchParams.get("category") as SupportCategory) || "other";
  const defaultRef = searchParams.get("ref") ?? "";

  const [category, setCategory] = useState<SupportCategory>(
    CATEGORIES.some((c) => c.value === defaultCategory) ? defaultCategory : "other"
  );
  const [subject, setSubject] = useState(
    defaultCategory === "payment" ? "Paid but premium not active" : ""
  );
  const [message, setMessage] = useState("");
  const [paymentReference, setPaymentReference] = useState(defaultRef);
  const [guestEmail, setGuestEmail] = useState("");
  const [username, setUsername] = useState(
    (telegramUsername ?? "").replace(/^@/, "")
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          subject,
          message,
          paymentReference: paymentReference || undefined,
          email: loggedIn ? undefined : guestEmail,
          telegramUsername: username,
          website: String(new FormData(e.currentTarget).get("website") ?? ""),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not send message");
        return;
      }

      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-[#101214] px-6 py-12 text-center sm:px-8">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15">
          <CheckCircle className="h-7 w-7 text-emerald-400" />
        </div>
        <h2
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
        >
          Message sent
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/70">
          We&apos;ll look into it and reply by email
          {loggedIn && email ? (
            <>
              {" "}
              (<span className="text-white">{email}</span>)
            </>
          ) : null}
          .
        </p>
        <Link href="/" className="auth-btn mt-8 inline-flex px-8 py-3.5 text-sm">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative rounded-[28px] border border-white/10 bg-[#101214] p-5 sm:p-7"
    >
      <HoneypotField />
      <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
        Send a message
      </p>

      <div className="space-y-5">
        {!loggedIn && (
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
              Your email
            </label>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              required
              className="auth-field w-full rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
        )}

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
            Telegram username
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-white/35">
              @
            </span>
            <input
              type="text"
              autoComplete="username"
              spellCheck={false}
              value={username.replace(/^@/, "")}
              onChange={(e) => setUsername(e.target.value.replace(/^@/, ""))}
              required
              minLength={3}
              maxLength={32}
              className="auth-field w-full rounded-xl py-3 pl-8 pr-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none"
              placeholder="username"
            />
          </div>
          <p className="mt-1.5 text-xs text-white/40">
            Same Telegram account you use for downloads.
          </p>
        </div>

        <div>
          <label className="mb-2.5 block text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={cn(
                  "cursor-pointer rounded-full border px-3.5 py-2 text-sm font-semibold transition",
                  category === c.value
                    ? "border-emerald-400/45 bg-emerald-500/15 text-emerald-300"
                    : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
            Subject
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            maxLength={120}
            className="auth-field w-full rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none"
            placeholder="Brief summary"
          />
        </div>

        {category === "payment" && (
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
              Payment reference
            </label>
            <input
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              className="auth-field w-full rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none"
              placeholder="vmc_… from your receipt"
            />
          </div>
        )}

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            maxLength={4000}
            className="auth-field w-full resize-y rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none"
            placeholder="Describe what happened…"
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "auth-btn w-full gap-2 py-3.5 text-sm",
            loading && "cursor-not-allowed opacity-60"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send to support
            </>
          )}
        </button>
      </div>
    </form>
  );
}
