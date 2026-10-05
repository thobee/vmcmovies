import SitePage from "@/components/layout/SitePage";
import Footer from "@/components/layout/Footer";
import CardSkeleton from "@/components/media/CardSkeleton";
import LoadingBar from "@/components/ui/LoadingBar";
import { Arc } from "@/components/loading-ui/arc";
import { cn } from "@/lib/cn";

type Variant = "account" | "access" | "search" | "support" | "catalog";

export default function PublicPageLoading({ variant = "catalog" }: { variant?: Variant }) {
  const showCards = variant === "catalog" || variant === "search";
  const compact = variant === "support";

  return (
    <SitePage>
      <LoadingBar />
      <main
        className={cn(
          "mx-auto w-full px-4 pb-16 pt-[104px] sm:px-6 lg:px-10",
          variant === "account" ? "max-w-6xl" : compact ? "max-w-4xl" : "max-w-screen-2xl",
        )}
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400/80">
          <Arc className="size-3 border-[1.5px]" />
          Loading
        </div>

        <div className="mt-5 h-11 w-64 max-w-full rounded-xl load-pulse" />
        <div className="mt-4 h-4 w-[28rem] max-w-full rounded-md load-pulse" />

        {variant === "access" && (
          <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-3 rounded-[28px] border border-white/10 bg-[#101214] p-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="size-5 rounded-full load-pulse" />
                  <div className="h-4 flex-1 rounded-md load-pulse" />
                </div>
              ))}
            </div>
            <div className="rounded-[28px] border border-white/10 bg-[#101214] p-5 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-72 rounded-2xl load-pulse" />
                ))}
              </div>
            </div>
          </div>
        )}

        {variant === "account" && (
          <div className="mt-8 space-y-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(310px,0.8fr)]">
              <div className="h-64 rounded-[28px] border border-white/10 bg-[#101214] p-5">
                <div className="h-4 w-28 rounded-md load-pulse" />
                <div className="mt-4 h-7 w-44 rounded-lg load-pulse" />
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="h-24 rounded-2xl load-pulse" />
                  <div className="h-24 rounded-2xl load-pulse" />
                </div>
              </div>
              <div className="h-64 rounded-[28px] border border-white/10 bg-[#101214] p-5">
                <div className="h-4 w-24 rounded-md load-pulse" />
                <div className="mt-4 h-6 w-48 rounded-lg load-pulse" />
                <div className="mt-4 h-4 w-full rounded-md load-pulse" />
                <div className="mt-8 h-12 w-full rounded-full load-pulse" />
              </div>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="h-56 rounded-[28px] load-pulse" />
              <div className="h-56 rounded-[28px] load-pulse" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-3xl load-pulse" />
              ))}
            </div>
          </div>
        )}

        {variant === "support" && (
          <div className="mt-8 space-y-4">
            <div className="h-28 rounded-[28px] border border-white/10 bg-[#101214] p-5">
              <div className="h-5 w-1/2 rounded-md load-pulse" />
              <div className="mt-4 h-4 w-2/3 rounded-md load-pulse" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-40 rounded-[28px] load-pulse" />
              <div className="h-40 rounded-[28px] load-pulse" />
            </div>
          </div>
        )}

        {showCards && (
          <div className="mt-8">
            <div className="mb-6 h-12 rounded-2xl load-pulse" />
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <CardSkeleton key={i} className="w-full" />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </SitePage>
  );
}
