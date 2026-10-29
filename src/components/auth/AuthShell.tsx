import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Compass,
} from "@phosphor-icons/react/dist/ssr";
import VmcLogo from "@/components/brand/VmcLogo";

export type AuthAside = {
  eyebrow?: string;
  headline: string;
  description: string;
};

/** How VMC works, shown on every auth page so new visitors understand the Telegram flow. */
const STEPS = [
  { title: "Create your account", text: "Email, password and your Telegram username." },
  { title: "Start the VMC bot", text: "Open it on Telegram and tap Start once." },
  { title: "Download", text: "Pick a title and the bot sends you the file." },
];

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
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(to_top,rgba(0,0,0,0.9),transparent)]"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col justify-center px-4 py-5 sm:px-6 md:py-6 lg:px-8">
        <div className="bezel-outer w-full">
          <div className="bezel-inner overflow-hidden border border-white/[0.06] bg-[#050505] shadow-[0_24px_90px_rgba(0,0,0,0.58)] md:grid md:min-h-[640px] md:grid-cols-[0.85fr_1.15fr] lg:grid-cols-[0.95fr_1.05fr]">
            {aside && (
              <aside className="auth-aside relative hidden min-w-0 flex-col gap-5 overflow-hidden p-6 md:flex lg:p-8 xl:p-10">
                <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                  <Image
                    src="/auth-movie-night.png"
                    alt=""
                    fill
                    sizes="(min-width: 1200px) 500px, (min-width: 768px) 45vw, 1px"
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.05)_30%,rgba(0,0,0,0.7)_55%,rgba(0,0,0,0.9)_100%)]" />
                </div>

                <div className="relative">
                  <VmcLogo href="/" height={48} priority />
                </div>

                <div className="relative mt-auto pt-32">
                  {aside.eyebrow && <p className="eyebrow-pill">{aside.eyebrow}</p>}
                  <h2
                    className="mt-4 text-3xl font-semibold leading-[1.15] text-white lg:text-4xl"
                    style={{ fontFamily: "var(--font-display)", letterSpacing: 0 }}
                  >
                    {aside.headline}
                  </h2>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">{aside.description}</p>

                  <ol className="mt-7 grid grid-cols-3 gap-2.5" aria-label="How VMC works">
                    {STEPS.map((step, index) => (
                      <li
                        key={step.title}
                        className={
                          index === 0
                            ? "rounded-2xl bg-white/[0.12] p-3.5 ring-1 ring-inset ring-white/20 backdrop-blur-md"
                            : "rounded-2xl bg-black/30 p-3.5 ring-1 ring-inset ring-white/10 backdrop-blur-md"
                        }
                      >
                        <span
                          className={
                            index === 0
                              ? "grid size-6 place-items-center rounded-full bg-emerald-400 text-xs font-bold text-black"
                              : "grid size-6 place-items-center rounded-full bg-white/15 text-xs font-bold text-white"
                          }
                        >
                          {index + 1}
                        </span>
                        <p className="mt-3 text-sm font-semibold leading-snug text-white">{step.title}</p>
                        <p className="mt-1 text-xs leading-5 text-white/65">{step.text}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                <p className="relative text-xs text-white/55">© Vintage Movie Channel</p>
              </aside>
            )}

            <div className="relative flex w-full min-w-0 flex-col px-5 py-6 sm:px-7 md:px-6 lg:px-9 xl:px-10">
              <header className="mb-5 flex items-center justify-between gap-3">
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
                    className="auth-chip inline-flex min-h-10 max-w-[60%] items-center gap-2 truncate px-3 py-2 text-xs font-medium text-white/70 transition hover:text-white sm:max-w-none sm:px-3.5"
                  >
                    <Compass className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Browse catalog</span>
                  </Link>
                )}

                <VmcLogo href="/" height={40} className="shrink-0" />
              </header>

              <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center">
                    <div className="text-left">
                      <h1
                        className="text-3xl font-semibold leading-tight text-white"
                        style={{ fontFamily: "var(--font-display)", letterSpacing: 0 }}
                      >
                        {title}
                      </h1>
                      {subtitle && (
                        <p className="mt-2 text-sm leading-relaxed text-white/60">
                          {subtitle}
                        </p>
                      )}
                    </div>
                    <div className="mt-6">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
