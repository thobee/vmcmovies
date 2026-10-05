import Link from "next/link";
import {
  ArrowRight,
  Check,
  Crown,
  DownloadSimple,
  FilmSlate,
  Lightning,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";
import SitePage from "@/components/layout/SitePage";
import Footer from "@/components/layout/Footer";
import PricingGrid from "@/components/access/PricingGrid";
import TelegramIcon from "@/components/brand/TelegramIcon";
import { getSession } from "@/lib/auth/session";
import { PREMIUM_FEATURES } from "@/lib/payments/plans";
import { formatMoney } from "@/lib/payments/currency";
import { getBillingConfig } from "@/lib/payments/billing/db";
import { daysUntil } from "@/lib/date";

const STEPS = [
  { icon: Crown, number: "01", title: "Choose your access", text: "Select the plan that fits how you watch." },
  { icon: FilmSlate, number: "02", title: "Find something good", text: "Browse every movie and series without limits." },
  { icon: DownloadSimple, number: "03", title: "Get it on Telegram", text: "Tap download and the bot sends your file." },
];

export default async function GetAccessPage() {
  const session = await getSession();
  const billing = await getBillingConfig();
  const isActive = session?.user.premiumStatus === "active";
  const expiry = session?.user.premiumExpiryDate
    ? new Date(session.user.premiumExpiryDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  const daysRemaining = session?.user.premiumExpiryDate
    ? daysUntil(session.user.premiumExpiryDate)
    : null;
  const entryPrice = billing.plans.monthly.NGN;

  return (
    <SitePage className="get-access-page overflow-hidden">
      <main className="relative mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32 lg:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute left-[-18rem] top-24 h-[36rem] w-[36rem] rounded-full bg-emerald-500/[0.07] blur-[120px]"
        />

        <section className="relative grid items-start gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(31rem,1.08fr)] lg:gap-14 xl:gap-20">
          <div className="pt-2 lg:sticky lg:top-28 lg:pt-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1.5 ring-1 ring-inset ring-emerald-300/20">
              <Lightning className="h-3.5 w-3.5 text-emerald-300" weight="fill" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">
                VMC Premium
              </span>
            </div>

            <h1
              className="mt-6 max-w-2xl text-[2.5rem] font-bold leading-[0.98] text-white sm:text-5xl lg:text-[3.75rem]"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}
            >
              {isActive ? "Keep the good stuff coming." : "Your next movie is one tap away."}
            </h1>

            <p className="mt-5 max-w-xl text-[15px] leading-7 text-white/60 sm:text-base sm:leading-8">
              {isActive
                ? `Your premium access runs until ${expiry}. Add another plan now and the time will stack automatically.`
                : "Browse the full catalog freely. Selected titles are free to download, while Premium unlocks the rest through Telegram."}
            </p>

            {!isActive && (
              <div className="mt-7 flex flex-wrap items-end gap-x-4 gap-y-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                    Access starts from
                  </p>
                  <p
                    className="mt-1 text-3xl font-bold text-white"
                    style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
                  >
                    {formatMoney(entryPrice, "NGN")}
                  </p>
                </div>
                <span className="mb-1.5 text-sm text-white/35">No automatic renewal</span>
              </div>
            )}

            <div className="mt-9 border-y border-white/[0.08] py-2">
              {STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className="group grid grid-cols-[2.75rem_1fr_auto] items-center gap-3 border-b border-white/[0.07] py-4 last:border-b-0"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-white/45 ring-1 ring-inset ring-white/[0.07] transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-emerald-400/10 group-hover:text-emerald-300">
                      <Icon className="h-[18px] w-[18px]" weight="duotone" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{step.title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-white/40">{step.text}</p>
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.18em] text-white/20">
                      {step.number}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-xs text-white/45">
              <span className="inline-flex items-center gap-2">
                <TelegramIcon className="h-4 w-4 text-[#2AABEE]" />
                Telegram delivery
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-300" weight="duotone" />
                Access linked to your account
              </span>
            </div>
          </div>

          <div className="rounded-[28px] bg-white/[0.035] p-1.5 ring-1 ring-inset ring-white/[0.08] sm:rounded-[32px] sm:p-2">
            <div className="relative overflow-hidden rounded-[22px] bg-[#101416] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:rounded-[25px]">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(ellipse_at_top_right,rgba(52,211,153,0.13),transparent_66%)]"
              />
              <div className="relative p-5 sm:p-7 lg:p-8">
                {session ? (
                  <PricingGrid isActive={isActive} expiry={expiry} daysRemaining={daysRemaining} />
                ) : (
                  <div className="py-2 sm:py-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-black shadow-[0_12px_30px_rgba(52,211,153,0.18)]">
                      <Crown className="h-6 w-6" weight="fill" />
                    </span>
                    <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                      One quick step
                    </p>
                    <h2
                      className="mt-2 text-3xl font-bold leading-tight text-white sm:text-[2.1rem]"
                      style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
                    >
                      Sign in to choose your plan.
                    </h2>
                    <p className="mt-3 max-w-md text-sm leading-6 text-white/55">
                      We use your account to activate premium immediately after payment and keep your downloads connected.
                    </p>

                    <div className="mt-7 grid gap-2.5">
                      {PREMIUM_FEATURES.slice(0, 4).map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center gap-3 rounded-xl bg-black/20 px-3.5 py-3 ring-1 ring-inset ring-white/[0.06]"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/10">
                            <Check className="h-3.5 w-3.5 text-emerald-300" weight="bold" />
                          </span>
                          <span className="text-sm text-white/70">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <Link
                        href="/signup"
                        className="group inline-flex min-h-13 flex-1 items-center justify-between rounded-full bg-emerald-400 py-2 pl-6 pr-2 text-sm font-bold text-black transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-emerald-300 active:scale-[0.98]"
                      >
                        Create free account
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/10 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                          <ArrowRight className="h-4 w-4" weight="bold" />
                        </span>
                      </Link>
                      <Link
                        href="/login?next=/get-access"
                        className="inline-flex min-h-13 items-center justify-center rounded-full bg-white/[0.05] px-7 text-sm font-semibold text-white ring-1 ring-inset ring-white/10 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.09] active:scale-[0.98]"
                      >
                        Log in
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </SitePage>
  );
}
