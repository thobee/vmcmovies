import Link from "next/link";
import { CreditCard, Download, MonitorPlay } from "lucide-react";

const STEPS = [
  {
    step: "1",
    icon: MonitorPlay,
    title: "Browse movies & series",
    body: "This site is a catalog. Scroll, search, and open any title — looking is free.",
  },
  {
    step: "2",
    icon: CreditCard,
    title: "Get premium",
    body: "Sign up once. That’s what unlocks downloads. Without it, you can still browse.",
  },
  {
    step: "3",
    icon: Download,
    title: "Click download",
    body: "Telegram opens. Our bot sends you the movie or series. No extra websites.",
  },
];

export default function HowItWorks() {
  return (
    <section className="border-t border-white/10 px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
      <div className="mx-auto mb-10 max-w-screen-2xl lg:mb-12 lg:flex lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
            How VMC works
          </p>
          <h2
            className="mt-3 text-[1.85rem] font-bold leading-tight text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
          >
            Browse here. Download on Telegram.
          </h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-white/70">
            VMC shows you movies and series. When you go premium and hit download, a Telegram bot
            sends you the file.
          </p>
        </div>
        <Link
          href="/get-access"
          className="auth-btn mt-6 hidden shrink-0 px-7 py-3 text-sm lg:inline-flex"
        >
          Get premium access
        </Link>
      </div>

      <div className="mx-auto grid max-w-screen-2xl gap-4 sm:grid-cols-3">
        {STEPS.map((item) => (
          <article
            key={item.step}
            className="flex flex-col rounded-3xl border border-white/10 bg-[#101214] p-6 sm:p-7"
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                <item.icon className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <span className="text-sm font-semibold text-white/50">Step {item.step}</span>
            </div>
            <h3 className="text-lg font-bold leading-snug text-white">{item.title}</h3>
            <p className="mt-2 text-[15px] leading-7 text-white/72">{item.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 text-center lg:hidden">
        <Link href="/get-access" className="auth-btn px-8 py-3.5 text-sm">
          Get premium access
        </Link>
      </div>
    </section>
  );
}
