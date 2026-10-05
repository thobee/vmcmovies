import LoadingBar from "@/components/ui/LoadingBar";
import { Arc } from "@/components/loading-ui/arc";

export default function AdminLoadingShell() {
  return (
    <div className="admin-app min-h-screen bg-[#181818] text-white md:flex">
      <LoadingBar />
      <aside className="hidden h-screen w-64 shrink-0 border-r border-white/6 bg-[#141414] p-5 md:block">
        <div className="h-11 w-36 rounded-xl load-pulse" />
        <div className="mt-10 space-y-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg load-pulse" />
          ))}
        </div>
      </aside>
      <main className="w-full px-4 py-5 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/35">
          <Arc className="size-3 border-[1.5px] text-amber" />
          Loading admin
        </div>
        <div className="mt-4 h-10 w-64 max-w-full rounded-xl load-pulse" />
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl load-pulse" />
          ))}
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl load-pulse" />
          ))}
        </div>
      </main>
    </div>
  );
}
