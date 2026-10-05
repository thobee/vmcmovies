import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import VmcLogo from "@/components/brand/VmcLogo";
import { getTelegramChannelUrl } from "@/lib/catalog/telegram";

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
      { label: "User dashboard", href: "/account" },
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

function getWhatsAppGroupUrl(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_GROUP?.trim() || "https://chat.whatsapp.com/F1gdeQA8GHRK5HyZRCNaUz";
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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
          <div className="mt-7 flex flex-col gap-2 sm:flex-row">
            <a href={getTelegramChannelUrl()} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-3 rounded-xl bg-[#2AABEE]/12 px-4 py-3 text-[#70cdff] ring-1 ring-[#2AABEE]/25 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#2AABEE]/18">
              <TelegramIcon className="h-5 w-5" />
              <span className="text-xs font-bold">Telegram updates</span>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <a href={getWhatsAppGroupUrl()} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-3 rounded-xl bg-[#25D366]/10 px-4 py-3 text-[#62e991] ring-1 ring-[#25D366]/20 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#25D366]/15">
              <WhatsAppIcon className="h-5 w-5" />
              <span className="text-xs font-bold">WhatsApp community</span>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
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
          <p>
            Built by <a href="https://tobithedev.vercel.app/" target="_blank" rel="noopener noreferrer" className="font-bold text-lime-300/80 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-lime-200">tobithedev</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
