"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

export default function ViewAllLink({
  href,
  label = "View all",
  className,
}: {
  href: string;
  label?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex shrink-0 items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white/65 backdrop-blur-sm transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-emerald-400/35 hover:bg-emerald-500/[0.08] hover:text-emerald-300 sm:px-4 sm:text-[13px]",
        className,
      )}
    >
      <span>{label}</span>
      <span
        className="btn-nested-icon bg-white/[0.08] text-white/70 group-hover:bg-emerald-400 group-hover:text-black"
        aria-hidden
      >
        <ArrowRight className="h-3.5 w-3.5" weight="bold" />
      </span>
    </Link>
  );
}
