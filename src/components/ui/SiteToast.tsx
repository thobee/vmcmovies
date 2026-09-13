"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Check, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type SiteToastTone = "success" | "error" | "info";

export type SiteToastInput = {
  title: string;
  message?: string;
  tone?: SiteToastTone;
};

type SiteToastItem = SiteToastInput & { id: string; tone: SiteToastTone };

const Ctx = createContext<((input: SiteToastInput) => void) | null>(null);

export function useSiteToast() {
  const toast = useContext(Ctx);
  if (!toast) throw new Error("useSiteToast must be used within SiteToastProvider");
  return toast;
}

export function SiteToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<SiteToastItem[]>([]);

  const toast = useCallback((input: SiteToastInput) => {
    const item: SiteToastItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: input.title,
      message: input.message,
      tone: input.tone ?? "success",
    };
    setToasts((prev) => [...prev.slice(-3), item]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== item.id));
    }, 4200);
  }, []);

  return (
    <Ctx.Provider value={toast}>
      {children}

      <div className="pointer-events-none fixed top-20 right-4 z-[90] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2.5">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex gap-3 rounded-2xl border border-white/10 bg-[#14181c]/95 px-3.5 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl animate-[toast-in_0.28s_ease-out]"
          >
            <div
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                t.tone === "error"
                  ? "bg-red-500/15 text-red-300"
                  : t.tone === "info"
                    ? "bg-white/6 text-white/70"
                    : "bg-emerald-500/15 text-emerald-300",
              )}
            >
              {t.tone === "error" ? (
                <X className="h-4 w-4" />
              ) : t.tone === "info" ? (
                <Info className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" strokeWidth={2.5} />
              )}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-semibold leading-snug text-white">{t.title}</p>
              {t.message && (
                <p className="mt-0.5 text-xs leading-relaxed text-white/45">{t.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="self-start rounded-lg p-1 text-white/25 hover:text-white/70"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
