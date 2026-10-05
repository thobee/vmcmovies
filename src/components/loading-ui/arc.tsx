import { cn } from "@/lib/cn";

export function Arc({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-4 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin",
        className,
      )}
    />
  );
}
