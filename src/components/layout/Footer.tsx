import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import VmcLogo from "@/components/brand/VmcLogo";

const FOOTER_GROUPS = [
  {
    title: "Explore",
    links: [
      { label: "Movies", href: "/movies" },
      { label: "TV Shows", href: "/series" },
      { label: "Search catalogue", href: "/search" },
    ],
  },
  {
    title: "Your VMC",
    links: [
      { label: "Premium plans", href: "/get-access" },
      { label: "Download guide", href: "/guide" },
      { label: "Support", href: "/support" },
    ],
  },
  {
    title: "Information",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 overflow-hidden text-white">
      <div className="relative border-y border-emerald-400/25 bg-gradient-to-r from-emerald-500 via-lime-400 to-emerald-300 text-black">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-start justify-between gap-5 px-4 py-6 sm:flex-row sm:items-center sm:px-6 lg:px-10">
          <div>
            <p className="text-lg font-extrabold leading-tight sm:text-xl" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>
              Ready to receive your next movie on Telegram?
            </p>
            <p className="mt-1 text-sm font-medium text-black/65">Browse free titles or unlock the full Premium catalogue.</p>
          </div>
          <Link href="/get-access" className="group inline-flex shrink-0 items-center gap-2.5 rounded-full bg-black py-1.5 pl-6 pr-1.5 text-sm font-bold text-emerald-300 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-emerald-200 active:scale-[0.98]">
            Compare plans
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
              <ArrowRight className="h-4 w-4" weight="bold" />
            </span>
          </Link>
        </div>
      </div>

      <div className="relative bg-[#0c1410]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(rgba(132,204,22,0.18) 1px, transparent 1px), linear-gradient(115deg, #0c1410 0%, #07130c 62%, #152508 100%)",
            backgroundSize: "22px 22px, 100% 100%",
          }}
        />

        <div className="relative mx-auto grid max-w-screen-2xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(18rem,0.85fr)_minmax(32rem,1.15fr)] lg:px-10 lg:py-16">
          <div className="max-w-md">
          <VmcLogo href="/" height={58} />
          <p className="mt-5 text-sm leading-7 text-white/58 sm:text-base">
            A clean catalogue for movies and series, with verified downloads delivered directly through Telegram.
          </p>
          </div>

          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-8 gap-y-9 sm:grid-cols-3">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300/75">{group.title}</p>
                <ul className="mt-4 space-y-3.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm font-medium text-white/55 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="relative mx-auto flex max-w-screen-2xl flex-col items-start justify-between gap-3 border-t border-emerald-300/[0.12] px-4 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:px-6 lg:px-10">
          <p>© {year} VMC — Vintage Movie Channel</p>
        </div>
      </div>
    </footer>
  );
}
