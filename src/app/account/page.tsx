import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  ChatCircle,
  Crown,
  FilmStrip,
  Question,
  ShieldCheck,
  Sparkle,
  Television,
} from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import SitePage from "@/components/layout/SitePage";
import Footer from "@/components/layout/Footer";
import LogoutButton from "@/components/auth/LogoutButton";
import TelegramUsernameEditor from "@/components/auth/TelegramUsernameEditor";
import TelegramSetupPrompt from "@/components/auth/TelegramSetupPrompt";
import { cn } from "@/lib/cn";
import WelcomePremiumCard from "@/components/access/WelcomePremiumCard";
import { getBillingPlansForUser } from "@/lib/payments/billing/resolve";
import type { PremiumStatus } from "@/lib/auth/types";
import { daysUntil } from "@/lib/date";

const STATUS: Record<
  PremiumStatus,
  { label: string; hint: string; badge: string; tone: string }
> = {
  none: {
    label: "Free account",
    hint: "Free titles are ready to download. Upgrade whenever you want the full catalog.",
    badge: "text-white/70 bg-white/[0.06] border-white/10",
    tone: "text-white/70",
  },
  pending: {
    label: "Payment pending",
    hint: "Premium turns on automatically as soon as Paystack confirms your payment.",
    badge: "text-amber-200 bg-amber-500/10 border-amber-500/25",
    tone: "text-amber-200",
  },
  active: {
    label: "Premium active",
    hint: "The full download catalog is unlocked for your account.",
    badge: "text-emerald-300 bg-emerald-500/10 border-emerald-500/25",
    tone: "text-emerald-300",
  },
  expired: {
    label: "Premium expired",
    hint: "Free titles remain available. Renew Premium to unlock the full catalog again.",
    badge: "text-red-300 bg-red-500/10 border-red-500/25",
    tone: "text-red-300",
  },
};

const QUICK_LINKS = [
  { href: "/movies", label: "Movies", hint: "Browse film releases", icon: FilmStrip },
  { href: "/series", label: "Series", hint: "Find TV shows", icon: Television },
  { href: "/guide", label: "Guide", hint: "Learn how VMC works", icon: BookOpen },
  { href: "/support", label: "Support", hint: "Get account help", icon: Question },
] as const;

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { welcome } = await searchParams;
  const { user } = session;
  const billing = await getBillingPlansForUser(user.id, "NGN");
  const showTelegramSetup = welcome === "1";
  const showPremiumWelcome = welcome === "premium" && user.premiumStatus === "active";
  const status =
    user.premiumStatus === "active" && user.premiumSource === "trial"
      ? {
          ...STATUS.active,
          label: "Welcome access active",
          hint: "Your launch trial has unlocked the full Premium catalog.",
        }
      : STATUS[user.premiumStatus];
  const expiryDate = user.premiumExpiryDate ? new Date(user.premiumExpiryDate) : null;
  const expiry = expiryDate
    ? expiryDate.toLocaleDateString("en-NG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  const daysRemaining = expiryDate ? daysUntil(expiryDate) : null;
  const hasTelegram = Boolean(user.telegramUsername?.trim());
  const trialEligible = billing.trial.eligible;

  const nextAction = !hasTelegram
    ? {
        eyebrow: "Finish setup",
        title: "Add your Telegram username",
        body: "Connect the same Telegram account you will use for the VMC channel and bot.",
        href: "#telegram-settings",
        label: "Add username",
      }
    : trialEligible
      ? {
          eyebrow: `${billing.trial.durationDays} days free`,
          title: "Activate your launch access",
          body: "Open any Premium movie or series and start your free access from its download section.",
          href: "/movies",
          label: "Choose a Premium title",
        }
    : user.premiumStatus === "pending"
      ? {
          eyebrow: "Payment pending",
          title: "Complete your payment",
          body: "Return to checkout to finish activating Premium access.",
          href: "/get-access",
          label: "Complete payment",
        }
      : user.premiumStatus === "active"
        ? {
            eyebrow: "Ready to download",
            title: "Choose your next title",
            body: "Your access is active. Open a movie or series and continue through Telegram.",
            href: "/movies",
            label: "Browse movies",
          }
        : {
            eyebrow: "Ready to begin",
            title: "Start with a Free title",
            body: "Free movies and series are available now, or view plans to unlock Premium titles.",
            href: "/movies",
            label: "Browse Free titles",
          };

  return (
    <SitePage>
      {showTelegramSetup && <TelegramSetupPrompt initial={user.telegramUsername} />}

      <main className="relative mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        <header className="mb-7 flex flex-col gap-4 border-b border-white/[0.08] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
              Member dashboard
            </p>
            <h1
              className="mt-3 text-[2rem] font-bold leading-tight text-white sm:text-[2.6rem]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your VMC account
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/52">
              Check your access, manage Telegram, and choose what to download next.
            </p>
          </div>
          <p className="break-all text-sm font-medium text-white/45">{user.email}</p>
        </header>

        {trialEligible && (
          <section className="mb-5 flex flex-col gap-4 rounded-2xl bg-emerald-400/[0.08] px-4 py-4 ring-1 ring-inset ring-emerald-300/20 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex min-w-0 items-start gap-3">
              <Sparkle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" weight="fill" />
              <div>
                <p className="text-sm font-bold text-emerald-200">
                  {billing.trial.bannerTitle}
                </p>
                <p className="mt-1 text-xs leading-5 text-white/58">
                  Your account qualifies. Open a Premium title and select Start {billing.trial.durationDays}-day free access. No card required.
                </p>
              </div>
            </div>
            <Link
              href="/movies"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-400 px-4 py-2.5 text-xs font-bold text-black transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-emerald-300"
            >
              Browse Premium titles
              <ArrowUpRight className="h-3.5 w-3.5" weight="bold" />
            </Link>
          </section>
        )}

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(310px,0.8fr)]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
            <div className="h-full rounded-[calc(2rem-0.375rem)] bg-[#0f1214] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                    Your access
                  </p>
                  <h2 className={cn("mt-2 text-2xl font-bold", status.tone)}>{status.label}</h2>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em]",
                    status.badge,
                  )}
                >
                  {user.premiumStatus === "active" && (
                    <Crown className="h-3.5 w-3.5" weight="fill" />
                  )}
                  {user.premiumStatus === "active" ? "Active" : status.label}
                </span>
              </div>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/58">{status.hint}</p>

              {user.premiumStatus === "active" && expiry && daysRemaining !== null ? (
                <div className="mt-6 grid gap-3 border-t border-white/[0.08] pt-5 sm:grid-cols-2">
                  <div className="rounded-2xl bg-emerald-400/[0.08] p-4 ring-1 ring-inset ring-emerald-300/15">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300/70">
                      Time remaining
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.035] p-4 ring-1 ring-inset ring-white/[0.08]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/38">
                      Expiry date
                    </p>
                    <p className="mt-2 text-base font-semibold text-white">{expiry}</p>
                    <p className="mt-1 text-xs text-white/38">Access remains active through this date.</p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 border-t border-white/[0.08] pt-5">
                  <Link
                    href="/get-access"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-emerald-200"
                  >
                    {user.premiumStatus === "expired" ? "Renew Premium" : "View Premium plans"}
                    <ArrowUpRight className="h-4 w-4" weight="bold" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-emerald-400/18 bg-emerald-500/[0.055] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <div className="flex h-full flex-col rounded-[calc(2rem-0.375rem)] bg-[#101513] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                {nextAction.eyebrow}
              </p>
              <h2 className="mt-3 text-xl font-bold text-white">{nextAction.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-white/55">{nextAction.body}</p>
              <Link
                href={nextAction.href}
                className="auth-btn group mt-6 w-full gap-3 px-5 py-3 text-sm"
              >
                {nextAction.label}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/15 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                  <ArrowUpRight className="h-4 w-4" weight="bold" />
                </span>
              </Link>
            </div>
          </aside>
        </section>

        {showPremiumWelcome && <WelcomePremiumCard welcome={billing.welcome} />}

        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)]">
          <div
            id="telegram-settings"
            className="scroll-mt-28 rounded-[2rem] border border-white/10 bg-white/[0.035] p-1.5 shadow-[0_18px_54px_rgba(0,0,0,0.2)]"
          >
            <div className="rounded-[calc(2rem-0.375rem)] bg-[#101214] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] sm:p-6">
              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#48b7ea]">
                  Download delivery
                </p>
                <h2 className="mt-2 text-xl font-bold text-white">Telegram setup</h2>
                <p className="mt-2 text-sm leading-6 text-white/52">
                  Keep this username matched to the Telegram account you use with VMC.
                </p>
              </div>
              <TelegramUsernameEditor initial={user.telegramUsername} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-1.5 shadow-[0_18px_54px_rgba(0,0,0,0.18)]">
            <div className="h-full rounded-[calc(2rem-0.375rem)] bg-[#101214] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/38">
                    Account details
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-white">Your profile</h2>
                </div>
                <ShieldCheck className="h-6 w-6 text-emerald-300/55" weight="light" />
              </div>
              <dl className="mt-6 divide-y divide-white/[0.07] rounded-2xl bg-black/18 px-4 ring-1 ring-inset ring-white/[0.07]">
                <div className="py-4">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">Email</dt>
                  <dd className="mt-1.5 break-all text-sm font-semibold text-white/82">{user.email}</dd>
                </div>
                <div className="py-4">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">Telegram</dt>
                  <dd className="mt-1.5 text-sm font-semibold text-white/82">
                    {hasTelegram ? `@${user.telegramUsername}` : "Not connected"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/38">Shortcuts</p>
            <h2 className="mt-2 text-xl font-bold text-white">Where do you want to go?</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_LINKS.map(({ href, label, hint, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-[1.5rem] border border-white/10 bg-[#101214] p-4 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-emerald-400/35 hover:bg-emerald-400/[0.06] active:scale-[0.99]"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-white/45 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-emerald-400/12 group-hover:text-emerald-300">
                    <Icon className="h-5 w-5" weight="light" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">{label}</span>
                    <span className="mt-1 block text-xs leading-5 text-white/45">{hint}</span>
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 text-white/22 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:text-emerald-300"
                    weight="bold"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 flex flex-col gap-4 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Need help with your account?</p>
            <p className="mt-1 text-sm leading-6 text-white/45">
              Support can help with payment, Telegram, login, or movie requests.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/support"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.08]"
            >
              <ChatCircle className="h-4 w-4" weight="bold" />
              Contact support
            </Link>
            <LogoutButton />
          </div>
        </section>
      </main>

      <Footer />
    </SitePage>
  );
}
