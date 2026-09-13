import Link from "next/link";
import {
  ArrowUpRight,
  Crown,
  Film,
  HelpCircle,
  MessageCircle,
  Tv,
} from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import SitePage from "@/components/layout/SitePage";
import Footer from "@/components/layout/Footer";
import VmcLogo from "@/components/brand/VmcLogo";
import LogoutButton from "@/components/auth/LogoutButton";
import TelegramUsernameEditor from "@/components/auth/TelegramUsernameEditor";
import TelegramSetupPrompt from "@/components/auth/TelegramSetupPrompt";
import { cn } from "@/lib/cn";
import WelcomePremiumCard from "@/components/access/WelcomePremiumCard";
import { getBillingConfig } from "@/lib/payments/billing/db";
import type { PremiumStatus } from "@/lib/auth/types";

const STATUS: Record<
  PremiumStatus,
  { label: string; hint: string; badge: string }
> = {
  none: {
    label: "Free account",
    hint: "Browse for free. Premium unlocks Telegram downloads.",
    badge: "text-white/70 bg-white/[0.06] border-white/10",
  },
  pending: {
    label: "Payment pending",
    hint: "Finish checkout on Get Access. Premium turns on after payment confirms.",
    badge: "text-amber-200 bg-amber-500/10 border-amber-500/25",
  },
  active: {
    label: "Premium active",
    hint: "Downloads are unlocked. Open any title and tap download.",
    badge: "text-emerald-300 bg-emerald-500/10 border-emerald-500/25",
  },
  expired: {
    label: "Premium expired",
    hint: "Continue from Get Access — plans start at ₦1,000/month or save with 3-month / 6-month plans. No auto-charge.",
    badge: "text-red-300 bg-red-500/10 border-red-500/25",
  },
};

const QUICK_LINKS = [
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/series", label: "TV Shows", icon: Tv },
  { href: "/support", label: "Support", icon: HelpCircle },
] as const;

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { welcome } = await searchParams;
  const billing = await getBillingConfig();
  const { user } = session;
  const showTelegramSetup = welcome === "1";
  const showPremiumWelcome = welcome === "premium" || user.premiumStatus === "active";
  const status = STATUS[user.premiumStatus];
  const expiry = user.premiumExpiryDate
    ? new Date(user.premiumExpiryDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  const needsPlan =
    user.premiumStatus === "none" ||
    user.premiumStatus === "expired" ||
    user.premiumStatus === "pending";

  return (
    <SitePage>
      {showTelegramSetup && <TelegramSetupPrompt initial={user.telegramUsername} />}

      <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        <div className="relative">
          <VmcLogo height={72} className="mb-6" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Account
          </p>
          <h1
            className="mt-3 text-[1.9rem] font-bold leading-tight text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
          >
            Your profile
          </h1>
        </div>

        <section className="relative mt-8 rounded-[28px] border border-white/12 bg-[#101214] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.35)] sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
                <VmcLogo height={52} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-white">{user.email}</p>
                <p className="mt-0.5 text-sm text-white/50">@{user.telegramUsername}</p>
                <span
                  className={cn(
                    "mt-2.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    status.badge,
                  )}
                >
                  {user.premiumStatus === "active" && (
                    <Crown className="h-3 w-3" strokeWidth={2.5} />
                  )}
                  {status.label}
                </span>
              </div>
            </div>

            <Link
              href="/get-access"
              className={
                needsPlan
                  ? "auth-btn shrink-0 gap-2 px-6 py-3 text-sm"
                  : "inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/4 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/8"
              }
            >
              {user.premiumStatus === "pending"
                ? "Complete payment"
                : user.premiumStatus === "active"
                  ? "Extend access"
                  : "Get premium"}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {showPremiumWelcome && user.premiumStatus === "active" && (
          <WelcomePremiumCard welcome={billing.welcome} />
        )}

        <section className="relative mt-4 rounded-[28px] border border-white/12 bg-[#101214] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.28)] sm:p-6">
          <div className="flex gap-4">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                user.premiumStatus === "active"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-white/6 text-white/60",
              )}
            >
              <Crown className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Downloads</h2>
              <p className="mt-1 max-w-md text-sm leading-6 text-white/65">{status.hint}</p>
              {user.premiumStatus === "active" && expiry && (
                <p className="mt-2 text-sm font-semibold text-emerald-300">Active until {expiry}</p>
              )}
            </div>
          </div>
        </section>

        <div className="relative mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[28px] border border-white/12 bg-[#101214] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.28)] sm:p-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
              Email
            </p>
            <p className="break-all text-sm font-medium text-white">{user.email}</p>
          </div>
          <div className="rounded-[28px] border border-white/12 bg-[#101214] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.28)] sm:p-6">
            <TelegramUsernameEditor initial={user.telegramUsername} />
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex min-h-13 items-center gap-3 rounded-2xl border border-white/12 bg-[#101214] px-4 py-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition hover:border-emerald-400/35 hover:bg-emerald-500/5"
            >
              <Icon className="h-4 w-4 text-white/40 transition group-hover:text-emerald-400" />
              <span className="text-sm font-medium text-white/75 group-hover:text-white">{label}</span>
              <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-white/20 group-hover:text-emerald-400" />
            </Link>
          ))}
        </div>

        <div className="relative mt-8 flex flex-col-reverse items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
          <Link
            href="/support"
            className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
          >
            <MessageCircle className="h-4 w-4" />
            Contact support
          </Link>
          <LogoutButton />
        </div>
      </div>

      <Footer />
    </SitePage>
  );
}
