import type { ReactNode } from "react";

/** Consistent page header across all admin pages. */
export default function AdminPageHeader({
  title,
  subtitle,
  badge,
  action,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-8">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1
            className="text-xl sm:text-[28px] text-white font-bold tracking-tight break-words"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.01em" }}
          >
            {title}
          </h1>
          {badge && (
            <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-semibold text-white/55">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-1.5 text-sm text-white/45 max-w-xl leading-relaxed">{subtitle}</p>
        )}
      </div>
      {action && <div className="w-full sm:w-auto shrink-0">{action}</div>}
    </div>
  );
}
