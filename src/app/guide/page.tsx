import Link from "next/link";
import {
  ArrowUpRight,
  ChatCircle,
  CheckCircle,
  Crown,
  DownloadSimple,
  FilmStrip,
  MagnifyingGlass,
  ShieldCheck,
  TelegramLogo,
} from "@phosphor-icons/react/dist/ssr";
import SitePage from "@/components/layout/SitePage";
import Footer from "@/components/layout/Footer";
import VmcLogo from "@/components/brand/VmcLogo";

const GUIDE_SECTIONS = [
  {
    title: "Create your account",
    icon: ShieldCheck,
    body: "Sign up with email or Google. Your account keeps your premium status, Telegram username, and support history in one place.",
  },
  {
    title: "Add Telegram",
    icon: TelegramLogo,
    body: "Add the same Telegram username you use in the Telegram app. This makes downloads easier to route after you unlock premium.",
  },
  {
    title: "Browse movies and series",
    icon: FilmStrip,
    body: "Use Movies, Series, Search, and filters to find the title you want. Open the details page to confirm the story, year, rating, and download action.",
  },
  {
    title: "Unlock premium",
    icon: Crown,
    body: "Premium is handled through Paystack checkout. Plans are manual, so there is no automatic renewal unless that is added later.",
  },
  {
    title: "Download through Telegram",
    icon: DownloadSimple,
    body: "After payment confirms, open a title and use the download button. VMC sends you toward the Telegram delivery flow for that movie or episode.",
  },
  {
    title: "Ask for help",
    icon: ChatCircle,
    body: "Use Support if payment does not confirm, a download link is missing, or you want to request a movie that is not in the catalog.",
  },
] as const;

const QUICK_TIPS = [
  "Use the same email whenever you log in.",
  "Keep your Telegram username updated before requesting downloads.",
  "If payment says pending, check your account dashboard before paying again.",
  "Use Support for movie requests, account problems, or download issues.",
] as const;

export default function GuidePage() {
  return (
    <SitePage>
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
            <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] bg-[#0f1214] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] sm:p-8">
              <div
                className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl"
                aria-hidden
              />
              <div className="relative">
                <VmcLogo height={66} />
                <p className="mt-8 inline-flex rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                  VMC guide
                </p>
                <h1
                  className="mt-4 max-w-2xl text-[2.25rem] font-bold leading-[0.96] text-white sm:text-5xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  How to use the site without confusion.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/62">
                  Learn how to set up your account, unlock premium, connect Telegram, find titles,
                  request movies, and get support when something needs attention.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/movies"
                    className="auth-btn group gap-3 px-5 py-3 text-sm active:scale-[0.98]"
                  >
                    Start browsing
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/15 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                      <ArrowUpRight className="h-4 w-4" weight="bold" />
                    </span>
                  </Link>
                  <Link
                    href="/account"
                    className="inline-flex items-center justify-center gap-3 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-emerald-400/35 hover:bg-emerald-400/8"
                  >
                    Open dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
            <div className="rounded-[calc(2rem-0.375rem)] bg-[#101214] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/12 text-emerald-300">
                  <MagnifyingGlass className="h-5 w-5" weight="light" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Quick tips</p>
                  <p className="text-xs text-white/45">For a smoother experience</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {QUICK_TIPS.map((tip) => (
                  <div
                    key={tip}
                    className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                  >
                    <CheckCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300"
                      weight="fill"
                    />
                    <p className="text-sm leading-6 text-white/62">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDE_SECTIONS.map(({ title, icon: Icon, body }) => (
            <article
              key={title}
              className="rounded-[1.75rem] border border-white/10 bg-[#101214] p-5 shadow-[0_14px_42px_rgba(0,0,0,0.18)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] text-emerald-300">
                <Icon className="h-5 w-5" weight="light" />
              </div>
              <h2 className="mt-5 text-base font-semibold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/58">{body}</p>
            </article>
          ))}
        </section>

        <section className="mt-5 rounded-[2rem] border border-white/10 bg-white/[0.035] p-1.5 shadow-[0_18px_54px_rgba(0,0,0,0.18)]">
          <div className="flex flex-col gap-4 rounded-[calc(2rem-0.375rem)] bg-[#101214] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-sm font-semibold text-emerald-300">Still stuck?</p>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-white/56">
                Contact support with your account email, payment issue, movie title, or Telegram
                username so the admin can help faster.
              </p>
            </div>
            <Link
              href="/support"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.08]"
            >
              <ChatCircle className="h-4 w-4" weight="bold" />
              Contact support
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </SitePage>
  );
}
