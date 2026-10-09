import type { InputHTMLAttributes, ReactNode } from "react";

export default function AuthField({
  id,
  label,
  icon,
  hint,
  error,
  className,
  ...props
}: {
  id: string;
  label: string;
  icon?: ReactNode;
  hint?: string;
  error?: string;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-white/80">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35">
            {icon}
          </span>
        )}
        <input
          id={id}
          {...props}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`auth-field w-full rounded-2xl py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none ${
            icon ? "pl-11 pr-4" : "px-4"
          } ${error ? "border-red-400/70 bg-red-500/[0.08] focus:border-red-300" : ""} ${className ?? ""}`}
        />
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-300">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[11px] text-white/35">{hint}</p>
      ) : null}
    </div>
  );
}
