import SitePage from "@/components/layout/SitePage";
import LoadingBar from "@/components/ui/LoadingBar";
import CardSkeleton from "@/components/media/CardSkeleton";

export default function SeriesLoading() {
  return (
    <SitePage>
      <LoadingBar />

      <div className="relative border-b border-white/10 px-4 pb-8 pt-[104px] sm:px-6 lg:px-10">
        <div className="relative mx-auto max-w-screen-2xl">
          <div className="h-3 w-28 rounded-md load-pulse" />
          <div className="mt-4 h-12 w-56 rounded-lg load-pulse" />
          <div className="mt-4 h-4 w-80 max-w-full rounded-md load-pulse" />
          <div className="mt-6 h-10 w-56 rounded-full load-pulse" />
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="mb-8 h-12 rounded-2xl load-pulse" />
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <CardSkeleton key={i} className="w-full" />
          ))}
        </div>
      </div>
    </SitePage>
  );
}
