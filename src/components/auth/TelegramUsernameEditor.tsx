"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CircleNotch } from "@phosphor-icons/react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSiteToast } from "@/components/ui/SiteToast";

export default function TelegramUsernameEditor({
  initial,
}: {
  initial: string;
}) {
  const router = useRouter();
  const { setUser } = useAuth();
  const toast = useSiteToast();
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setValue(initial);
    setSaved(initial);
  }, [initial]);

  const dirty =
    value.replace(/^@/, "").trim().toLowerCase() !== saved.toLowerCase();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirty || pending) return;
    setError("");
    setOk(false);
    setPending(true);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramUsername: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not update");
        return;
      }
      setUser(data.user);
      setSaved(data.user.telegramUsername);
      setValue(data.user.telegramUsername);
      setOk(true);
      toast({
        title: "Telegram username saved",
        message: `@${data.user.telegramUsername}`,
      });
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
        Telegram
      </p>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-white/35">
            @
          </span>
          <input
            type="text"
            autoComplete="username"
            spellCheck={false}
            value={value.replace(/^@/, "")}
            onChange={(e) => {
              setValue(e.target.value);
              setOk(false);
              setError("");
            }}
            className="auth-field w-full rounded-xl py-2.5 pl-8 pr-3 text-sm text-white placeholder:text-white/25 focus:outline-none"
            placeholder="username"
            maxLength={32}
            required
          />
        </div>
        <button
          type="submit"
          disabled={!dirty || pending}
          className="auth-btn min-h-10 shrink-0 gap-1.5 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? (
            <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
          ) : ok ? (
            <>
              <Check className="h-4 w-4" weight="bold" />
              Saved
            </>
          ) : (
            "Save"
          )}
        </button>
      </div>
      {error ? (
        <p className="text-xs text-red-300">{error}</p>
      ) : (
        <p className="text-xs text-white/35 leading-relaxed">
          Use this same account when joining the channel and bot.
        </p>
      )}
    </form>
  );
}
