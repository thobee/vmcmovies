"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSiteToast } from "@/components/ui/SiteToast";
import { cn } from "@/lib/cn";

export default function TelegramSetupPrompt({
  initial,
}: {
  initial: string;
}) {
  const router = useRouter();
  const { setUser } = useAuth();
  const toast = useSiteToast();
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState(initial.replace(/^@/, ""));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const finish = () => {
    setOpen(false);
    router.replace("/account");
    router.refresh();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setError("");
    setPending(true);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramUsername: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save username");
        return;
      }
      setUser(data.user);
      toast({
        title: "Telegram username saved",
        message: `@${data.user.telegramUsername}`,
      });
      finish();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-120 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={finish}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="telegram-setup-title"
        className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-[#101214] p-6 shadow-2xl sm:p-7"
      >
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
          <MessageCircle className="h-6 w-6" strokeWidth={2.2} />
        </div>

        <h2
          id="telegram-setup-title"
          className="text-xl font-bold text-white"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
        >
          Set your Telegram username
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Premium downloads are sent on Telegram. Use the same @username you use
          in the app so we can match your account.
        </p>

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div>
            <label htmlFor="telegram-setup" className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
              Telegram username
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-white/35">
                @
              </span>
              <input
                id="telegram-setup"
                type="text"
                autoComplete="username"
                spellCheck={false}
                autoFocus
                value={value}
                onChange={(e) => {
                  setValue(e.target.value.replace(/^@/, ""));
                  setError("");
                }}
                className="auth-field w-full rounded-xl py-3 pl-8 pr-3 text-sm text-white placeholder:text-white/25 focus:outline-none"
                placeholder="yourusername"
                maxLength={32}
                required
              />
            </div>
            {error ? (
              <p className="mt-2 text-xs text-red-300">{error}</p>
            ) : (
              <p className="mt-2 text-xs text-white/35">
                Letters, numbers, and underscores only.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending || value.trim().length < 2}
            className={cn(
              "auth-btn w-full gap-2 py-3.5 text-sm",
              pending && "cursor-not-allowed opacity-60",
            )}
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save username"
            )}
          </button>

          <button
            type="button"
            onClick={finish}
            className="w-full py-2 text-center text-sm text-white/45 transition hover:text-white/80"
          >
            I’ll do this later
          </button>
        </form>
      </div>
    </div>
  );
}
