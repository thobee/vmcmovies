import { cn } from "@/lib/cn";

export default function CinemaLoader({ className }: { className?: string }) {
  return (
    <div className={cn("cinema-loader", className)} aria-hidden>
      <div className="cinema-loader-recording">
        <span className="cinema-loader-dot" />
        <span className="cinema-loader-label">REC</span>
      </div>
      <div className="cinema-loader-device">
        <span className="cinema-loader-base" />
        <svg className="cinema-loader-screen" viewBox="0 0 42 30">
          <path
            d="M21 1H5C2.78 1 1 2.78 1 5V25a4 4 90 004 4H37a4 4 90 004-4V5c0-2.22-1.8-4-4-4H21"
            pathLength={100}
            strokeWidth={2}
            stroke="currentColor"
            fill="none"
          />
        </svg>
      </div>
      <span className="cinema-loader-action" />
    </div>
  );
}
