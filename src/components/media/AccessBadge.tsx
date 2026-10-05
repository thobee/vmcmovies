import { cn } from "@/lib/cn";
import type { ContentAccessKind } from "@/lib/catalog/types";

const LABELS: Record<ContentAccessKind, string> = {
  free: "Free",
  temporary_free: "Free",
  premium: "Premium",
};

const TONES: Record<ContentAccessKind, string> = {
  free: "bg-emerald-400 text-black ring-emerald-200/50",
  temporary_free: "bg-emerald-400 text-black ring-emerald-200/50",
  premium: "bg-amber-300 text-[#171006] ring-amber-100/50",
};

export default function AccessBadge({
  kind,
  className,
}: {
  kind: ContentAccessKind;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-5 shrink-0 items-center rounded px-1.5 py-0.5 text-[8px] font-extrabold uppercase leading-none ring-1 ring-inset sm:text-[9px]",
        TONES[kind],
        className,
      )}
    >
      {LABELS[kind]}
    </span>
  );
}
