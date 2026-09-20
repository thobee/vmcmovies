"use client";

import { useState } from "react";
import { FilmSlate } from "@phosphor-icons/react";
import { useAuth } from "@/components/auth/AuthProvider";
import RequestModal from "@/components/requests/RequestModal";
import { cn } from "@/lib/cn";

export default function RequestButton({ className }: { className?: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user || user.premiumStatus !== "active") return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/4 px-2.5 py-2 text-sm font-semibold text-white/75 transition hover:border-emerald-400/35 hover:bg-emerald-500/8 hover:text-white sm:px-3",
          className,
        )}
      >
        <FilmSlate className="h-4 w-4 shrink-0 text-emerald-400" weight="bold" />
        <span className="hidden min-[420px]:inline">Request</span>
      </button>
      <RequestModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
