import { cn } from "@/lib/cn";

export default function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("w-[168px] flex-shrink-0 sm:w-[192px] md:w-[216px]", className)}>
      <div className="aspect-[2/3] rounded-xl load-pulse" />
      <div className="mt-2.5 h-3 w-3/4 rounded-md load-pulse" />
      <div className="mt-1.5 h-2.5 w-1/2 rounded-md load-pulse" />
    </div>
  );
}
