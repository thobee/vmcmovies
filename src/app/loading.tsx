import SitePage from "@/components/layout/SitePage";
import LoadingBar from "@/components/ui/LoadingBar";
import RailSkeleton from "@/components/media/RailSkeleton";

export default function HomeLoading() {
  return (
    <SitePage className="overflow-x-hidden">
      <LoadingBar />

      <div className="px-4 pt-[92px] sm:px-6 lg:px-10">
        <div className="mx-auto max-w-screen-2xl overflow-hidden rounded-[28px] border border-white/[0.06]">
          <div className="relative min-h-[300px] load-pulse sm:min-h-[320px] lg:min-h-[360px]" />
        </div>
      </div>

      <div className="flex flex-col gap-12 pt-10 pb-14 sm:gap-14 sm:pt-12">
        <RailSkeleton />
        <RailSkeleton />
        <RailSkeleton />
      </div>
    </SitePage>
  );
}
