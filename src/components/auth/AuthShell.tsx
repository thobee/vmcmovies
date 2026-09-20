import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Check, Compass } from "@phosphor-icons/react/dist/ssr";
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
    <div className="auth-page relative min-h-[100dvh] overflow-x-hidden bg-black text-white">
      <div className="auth-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="auth-glow-secondary pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="bezel-outer w-full">
          <div className="bezel-inner overflow-hidden bg-[#050505] lg:grid lg:min-h-[min(720px,88dvh)] lg:grid-cols-[1.05fr_1fr]">
            {aside && (
              <aside className="auth-aside relative hidden flex-col justify-between p-8 lg:flex xl:p-10">
                <div className="auth-aside-glow pointer-events-none absolute inset-0" aria-hidden />

                <div className="relative">
                  <VmcLogo href="/" height={48} priority />
                </div>

                <div className="relative max-w-sm">
                  {aside.eyebrow && <p className="eyebrow-pill">{aside.eyebrow}</p>}
                  <h2
                    className="mt-4 text-[2rem] font-semibold leading-[1.15] text-white xl:text-[2.35rem]"
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
                            <Check className="h-3 w-3" weight="bold" />
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

            <div className="flex w-full flex-col px-5 py-7 sm:px-7 sm:py-9 lg:justify-center lg:px-10 lg:py-12 xl:px-12">
              {aside && (
                <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:hidden">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-400/90">
                    {aside.eyebrow ?? "VMC"}
                  </p>
                  <p className="mt-1.5 text-base font-semibold leading-snug text-white">{aside.headline}</p>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/45">{aside.description}</p>
                </div>
              )}

              <header className="mb-6 flex items-center justify-between gap-3 sm:mb-8">
                {backHref ? (
                  <Link
                    href={backHref}
                    className="auth-chip flex h-10 w-10 shrink-0 items-center justify-center text-white/70 transition hover:text-white"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                ) : (
                  <Link
                    href="/"
                    className="auth-chip inline-flex max-w-[60%] items-center gap-2 truncate px-3 py-2 text-xs font-medium text-white/55 transition hover:text-white/90 sm:max-w-none sm:px-3.5"
                  >
                    <Compass className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Browse catalog</span>
                  </Link>
                )}

                <VmcLogo href="/" height={40} className="shrink-0" />
              </header>

              <div className="mx-auto w-full max-w-[420px] lg:mx-0 lg:max-w-[440px]">
                <h1
                  className="text-[1.75rem] font-semibold leading-tight text-white sm:text-[2.1rem] lg:text-[2.25rem]"
                  style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
                >
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-2 text-sm leading-relaxed text-white/45 sm:mt-2.5">{subtitle}</p>
                )}
                <div className="mt-7 sm:mt-8">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
