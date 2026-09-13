import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
        "group inline-flex shrink-0 items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white/65 backdrop-blur-sm transition duration-200 hover:border-emerald-400/35 hover:bg-emerald-500/[0.08] hover:text-emerald-300 sm:px-4 sm:text-[13px]",
        className,
      )}
    >
      <span>{label}</span>
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.08] text-white/70 transition duration-200 group-hover:translate-x-0.5 group-hover:bg-emerald-400 group-hover:text-black"
        aria-hidden
      >
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
      </span>
    </Link>
  );
}
