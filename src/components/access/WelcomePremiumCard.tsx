"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Crown, X } from "lucide-react";
import type { BillingConfig } from "@/lib/payments/billing/types";

const SEEN_KEY = "vmc_welcome_premium_seen";

export default function WelcomePremiumCard({ welcome }: { welcome: BillingConfig["welcome"] }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!welcome.enabled) return;
    try {
      if (localStorage.getItem(SEEN_KEY) === "1") return;
      setVisible(true);
    } catch {
      setVisible(true);
    }
  }, [welcome.enabled]);

  if (!visible || !welcome.enabled) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <section className="relative mt-4 rounded-[28px] border border-emerald-400/25 bg-emerald-500/10 p-5 sm:p-6">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss welcome"
        className="absolute right-4 top-4 rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
        <Crown className="h-4 w-4" />
        {welcome.title}
      </p>
      <p className="mt-2 max-w-lg text-sm leading-6 text-white/75">{welcome.intro}</p>
      <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-white/40">How downloads work</p>
        <p className="text-sm leading-6 text-white/70">{welcome.downloadSteps}</p>
      </div>
      <Link
        href={welcome.watchFirstHref || "/movies"}
        className="auth-btn mt-5 inline-flex gap-2 px-6 py-3 text-sm"
        onClick={dismiss}
      >
        {welcome.watchFirstLabel || "Browse movies"}
      </Link>
    </section>
  );
}
