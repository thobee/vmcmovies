import type { ReactNode } from "react";

export const inputClass =
  "w-full min-h-11 px-3.5 py-2.5 rounded-xl field text-base sm:text-sm text-white placeholder:text-white/30 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

export const primaryBtnClass =
  "inline-flex items-center justify-center w-full sm:w-auto min-h-11 px-6 rounded-xl bg-[var(--amber)] text-white font-bold text-sm shadow-lg shadow-[var(--amber)]/15 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[var(--amber-hover)]";

export const backLinkClass =
  "mb-5 inline-flex items-center gap-1.5 min-h-9 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/50 hover:text-white hover:border-white/20 transition-colors";

export function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
        {label}
        {required && <span className="text-[var(--amber)]"> *</span>}
      </label>
      {hint && <p className="mb-2 text-[12px] leading-5 text-white/35">{hint}</p>}
      {children}
    </div>
  );
}

export function FormSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl panel p-4 sm:p-5 space-y-4">
      <header>
        <h2 className="text-sm font-semibold text-white tracking-tight">{title}</h2>
        {hint && <p className="mt-1 text-xs leading-5 text-white/40">{hint}</p>}
      </header>
      {children}
    </section>
  );
}

export function FormError({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      {children}
    </div>
  );
}

export function FormActions({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-[#181818] from-40% to-transparent">
      {children}
    </div>
  );
}

export function CheckRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--amber)]"
      />
      <span className="text-sm text-white/70 leading-5">{children}</span>
    </label>
  );
}
