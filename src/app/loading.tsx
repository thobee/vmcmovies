import CinemaLoader from "@/components/loading-ui/CinemaLoader";
import LoadingBar from "@/components/ui/LoadingBar";

export default function AppLoading() {
  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#050606] px-4 text-white">
      <LoadingBar />
      <div className="relative flex flex-col items-center text-center" role="status" aria-live="polite">
        <CinemaLoader />
        <p
          className="mt-8 text-3xl font-black uppercase leading-none text-white sm:text-4xl"
          style={{ fontFamily: "var(--font-comic), var(--font-display), system-ui, sans-serif" }}
        >
          Getting your movie ready
        </p>
        <p className="mt-2 text-sm text-white/42">One moment...</p>
      </div>
    </div>
  );
}
