import AuthShell from "@/components/auth/AuthShell";
import { Arc } from "@/components/loading-ui/arc";

export default function AuthPageLoading() {
  return (
    <AuthShell
      title="Preparing your access"
      subtitle="Loading the secure sign-in form."
      backHref="/"
      aside={{
        eyebrow: "VMC",
        headline: "Movies, series, and downloads in one account.",
        description: "Your profile, Telegram username, and premium access stay connected.",
        highlights: ["Secure account access", "Premium downloads", "Fast catalog updates"],
      }}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300/80">
          <Arc className="size-3 border-[1.5px]" />
          Loading
        </div>
        <div className="h-12 rounded-full load-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
          <div className="h-[76px] rounded-2xl load-pulse" />
          <div className="h-[76px] rounded-2xl load-pulse" />
          <div className="h-[76px] rounded-2xl load-pulse" />
          <div className="h-[76px] rounded-2xl load-pulse" />
        </div>
        <div className="h-12 rounded-full load-pulse" />
      </div>
    </AuthShell>
  );
}
