import type { ReactNode } from "react";

export const inputClass =
  "w-full min-h-12 px-4 py-3 rounded-xl field text-base md:min-h-11 md:py-2.5 md:text-sm text-white placeholder:text-white/40 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

export const primaryBtnClass =
  "inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-12 px-6 rounded-xl bg-[var(--amber)] text-black font-bold text-base md:text-sm shadow-lg shadow-[var(--amber)]/15 transition-[background-color,scale] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[var(--amber-hover)]";

export const backLinkClass =
  "mb-5 inline-flex items-center gap-2 min-h-11 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/75 hover:text-white hover:border-white/25 transition-colors";

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
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/65">
        {label}
        {required && <span className="text-[var(--amber)]"> *</span>}
      </label>
      {hint && <p className="mb-2 text-[13px] leading-5 text-white/60">{hint}</p>}
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
    <section className="rounded-2xl panel p-4 sm:p-5 space-y-5">
      <header>
        <h2 className="text-base font-semibold text-white tracking-tight">{title}</h2>
        {hint && <p className="mt-1 text-[13px] leading-5 text-white/60">{hint}</p>}
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
    <label className="flex min-h-12 items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-5 shrink-0 accent-[var(--amber)]"
      />
      <span className="text-[15px] md:text-sm text-white/80 leading-6 md:leading-5">{children}</span>
    </label>
  );
}
