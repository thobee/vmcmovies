import VmcLogo from "@/components/brand/VmcLogo";
import LoadingBar from "@/components/ui/LoadingBar";

export default function AppLoading() {
  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#050606] px-4 text-white">
      <LoadingBar />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.18),transparent_58%)]"
        aria-hidden
      />
      <div className="relative flex flex-col items-center text-center" role="status" aria-live="polite">
        <div className="vmc-logo-loader relative flex size-32 items-center justify-center rounded-[2rem] border border-emerald-300/15 bg-white/[0.035] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_24px_70px_rgba(0,0,0,0.5)] sm:size-36">
          <div className="pointer-events-none absolute inset-3 rounded-[1.55rem] border border-emerald-300/10" aria-hidden />
          <VmcLogo height={76} priority />
        </div>
        <p
          className="vmc-loading-text mt-8 text-5xl font-black uppercase leading-none text-white sm:text-6xl"
          style={{ fontFamily: "var(--font-comic), var(--font-display), system-ui, sans-serif" }}
        >
          Loading !!!
        </p>
      </div>
    </div>
  );
}
