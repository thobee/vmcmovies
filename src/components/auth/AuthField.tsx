import type { InputHTMLAttributes, ReactNode } from "react";

export default function AuthField({
  id,
  label,
  icon,
  hint,
  className,
  ...props
}: {
  id: string;
  label: string;
  icon?: ReactNode;
  hint?: string;
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
          className={`auth-field w-full rounded-2xl py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none ${
            icon ? "pl-11 pr-4" : "px-4"
          } ${className ?? ""}`}
        />
      </div>
      {hint && <p className="mt-1.5 text-[11px] text-white/35">{hint}</p>}
    </div>
  );
}
