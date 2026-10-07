import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import MobileDock from "@/components/layout/MobileDock";
import { cn } from "@/lib/cn";

export default function SitePage({
  children,
  className,
  glow = true,
}: {
  children: ReactNode;
  className?: string;
  /** Subtle emerald wash under the navbar — disable on full-bleed hero pages if needed */
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative min-h-screen bg-[#060809] pb-[calc(5.75rem+env(safe-area-inset-bottom))] text-white md:pb-0",
        className,
      )}
    >
      <Navbar />
      <div
        className="pointer-events-none absolute inset-x-0 top-20 z-[1] h-px bg-gradient-to-r from-transparent via-emerald-400/25 to-transparent"
        aria-hidden
      />
      {glow && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-72 bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.08),transparent_58%)]"
          aria-hidden
        />
      )}
      <div className="relative z-[2]">{children}</div>
      <MobileDock />
    </div>
  );
}
