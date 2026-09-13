import Link from "next/link";
import { Check, Download } from "lucide-react";
import SitePage from "@/components/layout/SitePage";
import Footer from "@/components/layout/Footer";
import PricingGrid from "@/components/access/PricingGrid";
import TelegramIcon from "@/components/brand/TelegramIcon";
import VmcLogo from "@/components/brand/VmcLogo";
import { getSession } from "@/lib/auth/session";
import { PREMIUM_FEATURES } from "@/lib/payments/plans";
import { getBillingConfig } from "@/lib/payments/billing/db";

const STEPS = [
  { n: "1", title: "Make an account", text: "Sign up so we can attach premium to you." },
  {
    n: "2",
    title: "Pay for a plan",
    text: "Pick monthly, 3 months, or 6 months. Launch offer: first month from ₦700.",
  },
  {
    n: "3",
    title: "Click download",
    text: "Open a movie or series. Telegram opens and the bot sends the file.",
  },
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

  return (
    <SitePage className="get-access-page">
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <div className="relative grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
          <div className="lg:sticky lg:top-28">
            <div className="mb-4 flex items-center gap-3">
              <VmcLogo height={40} priority />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                Premium
              </span>
            </div>

            <h1
              className="text-[1.75rem] font-bold leading-tight text-white sm:text-4xl"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
            >
              {isActive ? "Add more time" : "Unlock Telegram downloads"}
            </h1>

            <p className="mt-4 max-w-md text-sm leading-7 text-white/70 sm:text-base">
              {isActive
                ? `You're active until ${expiry}. A new plan stacks on top of that date — no auto-charge.`
                : billing.launchOffer.enabled
                  ? "Browse for free. Premium unlocks Telegram downloads. Launch offer: first month from ₦700, then continues at standard pricing."
                  : "Browse movies and series for free. Premium means when you hit download, a Telegram bot sends you the file."}
            </p>

            <ul className="mt-6 space-y-2.5 sm:mt-8 sm:space-y-3">
              {PREMIUM_FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-3 text-sm leading-6 text-white/80 sm:text-[15px]"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                    <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2.6} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-white/10 bg-[#101214] px-4 py-3.5 sm:mt-8">
              <p className="flex items-center gap-2 text-xs font-semibold text-white/80">
                <TelegramIcon className="h-4 w-4 text-[#2AABEE]" />
                Telegram delivery
              </p>
              <p className="mt-1 text-xs leading-5 text-white/45">
                Files sent straight to your bot chat.
              </p>
            </div>

            <div className="mt-6 space-y-4 rounded-[24px] border border-white/10 bg-[#101214] p-5 sm:rounded-3xl sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                How it works
              </p>
              {STEPS.map((s) => (
                <div key={s.n} className="flex gap-3.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-sm font-bold text-emerald-400">
                    {s.n}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{s.title}</p>
                    <p className="mt-0.5 text-sm leading-6 text-white/65">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#101214] sm:rounded-[28px]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 70% 50% at 100% 0%, rgba(34,197,94,0.12), transparent 55%)",
              }}
            />
            <div className="relative p-5 sm:p-8">
              {session ? (
                <PricingGrid isActive={isActive} expiry={expiry} />
              ) : (
                <div className="py-6 text-center sm:py-10">
                  <VmcLogo height={48} className="mx-auto" />
                  <h2
                    className="mt-5 text-2xl font-bold text-white"
                    style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
                  >
                    Sign in first
                  </h2>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-white/70 sm:text-[15px]">
                    Log in or create an account so premium lands on the right profile after you pay.
                  </p>
                  <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3">
                    <Link href="/signup" className="auth-btn min-h-12 py-3.5 text-sm">
                      Create account
                    </Link>
                    <Link
                      href="/login?next=/get-access"
                      className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/4 py-3.5 text-sm font-semibold text-white transition hover:bg-white/8"
                    >
                      Log in
                    </Link>
                  </div>
                  <p className="mx-auto mt-6 flex max-w-xs items-center justify-center gap-2 text-xs text-white/40">
                    <Download className="h-3.5 w-3.5 text-emerald-400/80" />
                    Browse free — pay only when you want downloads
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </SitePage>
  );
}
