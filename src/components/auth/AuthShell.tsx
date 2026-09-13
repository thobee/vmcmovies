import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Check, Compass } from "lucide-react";
import VmcLogo from "@/components/brand/VmcLogo";

export type AuthAside = {
  eyebrow?: string;
  headline: string;
  description: string;
  highlights?: string[];
};

export default function AuthShell({
  title,
  subtitle,
  aside,
  children,
  backHref,
}: {
  title: string;
  subtitle?: string;
  aside?: AuthAside;
  children: ReactNode;
  backHref?: string;
}) {
  return (
    <div className="auth-page relative min-h-screen overflow-hidden bg-black text-white">
      <div className="auth-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="auth-glow-secondary pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto min-h-screen w-full max-w-6xl lg:flex lg:items-center lg:px-8 lg:py-10">
        <div className="auth-card grid min-h-screen w-full lg:min-h-[640px] lg:overflow-hidden lg:rounded-[28px] lg:border lg:border-white/[0.08] lg:bg-[#050505] lg:shadow-[0_32px_100px_rgba(0,0,0,0.65)] lg:grid-cols-[1.08fr_1fr]">
          {aside && (
            <aside className="auth-aside relative hidden flex-col justify-between p-10 lg:flex xl:p-12">
              <div className="auth-aside-glow pointer-events-none absolute inset-0" aria-hidden />

              <div className="relative">
                <VmcLogo href="/" height={52} priority />
              </div>

              <div className="relative max-w-sm">
                {aside.eyebrow && (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-400">
                    {aside.eyebrow}
                  </p>
                )}
                <h2
                  className="mt-3 text-[2rem] font-bold leading-[1.15] text-white xl:text-[2.35rem]"
                  style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
                >
                  {aside.headline}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-white/45">{aside.description}</p>

                {aside.highlights && aside.highlights.length > 0 && (
                  <ul className="mt-9 space-y-3.5">
                    {aside.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-white/60">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <p className="relative text-xs text-white/25">© Vintage Movie Channel</p>
            </aside>
          )}

          <div className="relative flex min-h-screen flex-col px-5 py-8 sm:px-6 lg:min-h-0 lg:justify-center lg:px-10 lg:py-12 xl:px-12">
            <header className="mb-10 flex items-center justify-between lg:mb-12">
              {backHref ? (
                <Link
                  href={backHref}
                  className="auth-chip flex h-10 w-10 items-center justify-center text-white/70 transition hover:text-white"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              ) : (
                <Link
                  href="/"
                  className="auth-chip inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white/55 transition hover:text-white/90"
                >
                  <Compass className="h-3.5 w-3.5" />
                  Browse catalog
                </Link>
              )}

              <VmcLogo href="/" height={44} />
            </header>

            <div className="mx-auto w-full max-w-md flex-1 lg:max-w-none lg:flex-none">
              <h1
                className="text-[2.1rem] font-bold leading-tight text-white sm:text-[2.35rem]"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
              >
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-white/40">{subtitle}</p>
              )}
              <div className="mt-8 lg:mt-9">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
