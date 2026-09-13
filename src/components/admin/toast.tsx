"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { Check, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type ToastTone = "success" | "error" | "info";

export type ToastInput = {
  title: string;
  message?: string;
  tone?: ToastTone;
};

type ToastItem = ToastInput & { id: string; tone: ToastTone };

type ConfirmInput = {
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
};

type ToastCtx = {
  toast: (input: ToastInput) => void;
  confirm: (input: ConfirmInput) => Promise<boolean>;
};

const Ctx = createContext<ToastCtx | null>(null);
const STORAGE_KEY = "vmc_admin_toast";

export function queueAdminToast(input: ToastInput) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(input));
  } catch {
    /* ignore */
  }
}

export function useAdminToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminToast must be used within AdminToastProvider");
  return ctx;
}

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [dialog, setDialog] = useState<(ConfirmInput & { resolve: (v: boolean) => void }) | null>(
    null
  );

  const toast = useCallback((input: ToastInput) => {
    const item: ToastItem = {
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

  const confirm = useCallback((input: ConfirmInput) => {
    return new Promise<boolean>((resolve) => {
      setDialog({ ...input, resolve });
    });
  }, []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      sessionStorage.removeItem(STORAGE_KEY);
      const parsed = JSON.parse(raw) as ToastInput;
      if (parsed?.title) toast(parsed);
    } catch {
      /* ignore */
    }
  }, [pathname, toast]);

  const closeDialog = (value: boolean) => {
    dialog?.resolve(value);
    setDialog(null);
  };

  return (
    <Ctx.Provider value={{ toast, confirm }}>
      {children}

      <div className="pointer-events-none fixed top-4 right-4 z-[80] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2.5">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex gap-3 rounded-2xl border border-white/[0.08] bg-[#1a1a1a]/92 px-3.5 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl animate-[toast-in_0.28s_ease-out]"
          >
            <div
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                t.tone === "error"
                  ? "bg-red-500/15 text-red-300"
                  : t.tone === "info"
                    ? "bg-white/[0.06] text-white/70"
                    : "bg-emerald-500/15 text-emerald-300"
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
              <p className="text-sm font-semibold text-white leading-snug">{t.title}</p>
              {t.message && (
                <p className="mt-0.5 text-xs text-white/45 leading-relaxed">{t.message}</p>
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

      {dialog && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
            aria-label="Cancel"
            onClick={() => closeDialog(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-confirm-title"
            className="relative w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#1e1e1e] p-5 shadow-2xl"
          >
            <h2 id="admin-confirm-title" className="text-base font-semibold text-white">
              {dialog.title}
            </h2>
            <p className="mt-2 text-sm text-white/50 leading-relaxed">{dialog.message}</p>
            <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                type="button"
                onClick={() => closeDialog(false)}
                className="min-h-11 rounded-xl border border-white/10 px-4 text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.04]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => closeDialog(true)}
                className={cn(
                  "min-h-11 rounded-xl px-4 text-sm font-bold text-white",
                  dialog.destructive
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-[var(--amber)] hover:bg-[var(--amber-hover)]"
                )}
              >
                {dialog.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
