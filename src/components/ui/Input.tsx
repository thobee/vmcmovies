"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full px-4 py-3 rounded-xl field text-white text-sm placeholder:text-white/25 outline-none transition-colors focus:border-[var(--amber)]/60 focus:ring-2 focus:ring-[var(--amber)]/15",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";

export default Input;
