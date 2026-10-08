import Link from "next/link";
import { ArrowRight, DownloadSimple, MagnifyingGlass, User } from "@phosphor-icons/react/dist/ssr";

const STEPS = [
  { icon: MagnifyingGlass, title: "Find a title", body: "Browse movies and series. Check the Free or Premium badge." },
  { icon: User, title: "Log in to download", body: "Premium titles need an active trial or a paid plan." },
  { icon: DownloadSimple, title: "Open Telegram", body: "Complete the first-time setup, then choose your download." },
];

export default function HowItWorks() {
  return (
    <section aria-labelledby="how-vmc-works" className="border-y border-white/[0.08] px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="how-vmc-works" className="text-xl font-semibold text-white sm:text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            Browse here. Download on Telegram.
          </h2>
          <Link href="/guide" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200">
            How to download
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <ol className="mt-5 grid gap-5 sm:grid-cols-3 sm:gap-6">
          {STEPS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex items-start gap-3">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden />
              <div>
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                <p className="mt-1 max-w-sm text-sm leading-6 text-white/60">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
