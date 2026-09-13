import type { Quality } from "@/lib/catalog/quality";
import { cn } from "@/lib/cn";

interface QualityBadgesProps {
  qualities?: Quality[];
  size?: "sm" | "md";
  /** Collapse the list into one gold badge: "4K" if available, else "HD". */
  hd?: boolean;
  className?: string;
}

/** Full list: dark ash text chips, blue for 4K. `hd` renders a single gold badge. */
export default function QualityBadges({
  qualities,
  size = "md",
  hd = false,
  className,
}: QualityBadgesProps) {
  if (!qualities?.length) return null;

  const compact = size === "sm";

  if (hd) {
    return (
      <span
        className={cn(
          "inline-flex items-center font-extrabold leading-none rounded bg-[var(--gold)] text-black tracking-wide",
          compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px]",
          className
        )}
      >
        {qualities.includes("4K") ? "4K" : "HD"}
      </span>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {qualities.map((q) => (
        <span
          key={q}
          title={q}
          className={cn(
            "inline-flex items-center font-bold leading-none rounded",
            q === "4K"
              ? "bg-emerald-400 text-black"
              : "bg-white/10 text-white/85 ring-1 ring-white/15",
            compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px]"
          )}
        >
          {q}
        </span>
      ))}
    </div>
  );
}
