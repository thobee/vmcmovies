import CardSkeleton from "@/components/media/CardSkeleton";

export default function RailSkeleton({ count = 7 }: { count?: number }) {
  return (
    <section className="w-full overflow-hidden">
      <div className="mb-5 px-4 sm:px-6 lg:px-10">
        <div className="h-5 w-44 rounded-md load-pulse" />
        <div className="mt-2 h-3 w-20 rounded-md load-pulse" />
      </div>
      <div className="flex gap-3.5 px-4 sm:px-6 lg:px-10">
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
