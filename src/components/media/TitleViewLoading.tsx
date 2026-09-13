import SitePage from "@/components/layout/SitePage";
import LoadingBar from "@/components/ui/LoadingBar";

export default function TitleViewLoading() {
  return (
    <SitePage glow={false}>
      <LoadingBar />
      <div className="relative px-4 pt-[104px] pb-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-screen-2xl">
          <div className="h-4 w-24 rounded-md load-pulse" />
          <div className="mt-6 grid items-start gap-8 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
            <div className="mx-auto w-44 sm:w-52 lg:mx-0 lg:w-full">
              <div className="aspect-[2/3] rounded-2xl load-pulse" />
            </div>
            <div className="space-y-4">
              <div className="h-4 w-40 rounded-full load-pulse" />
              <div className="h-12 w-2/3 rounded-lg load-pulse" />
              <div className="h-4 w-1/2 rounded-md load-pulse" />
              <div className="h-24 w-full max-w-xl rounded-xl load-pulse" />
              <div className="h-48 rounded-[28px] load-pulse" />
            </div>
          </div>
        </div>
      </div>
    </SitePage>
  );
}
