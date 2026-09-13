import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import VmcLogo from "@/components/brand/VmcLogo";
import { getTelegramChannelUrl } from "@/lib/catalog/telegram";

const NAV = [
  { label: "Movies", href: "/movies" },
  { label: "TV Shows", href: "/series" },
  { label: "Get premium", href: "/get-access" },
  { label: "Account", href: "/account" },
  { label: "Support", href: "/support" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
] as const;

function getWhatsAppGroupUrl(): string {
  return (
    process.env.NEXT_PUBLIC_WHATSAPP_GROUP?.trim() ||
    "https://chat.whatsapp.com/F1gdeQA8GHRK5HyZRCNaUz"
  );
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
  const telegramUrl = getTelegramChannelUrl();
  const whatsappUrl = getWhatsAppGroupUrl();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 overflow-hidden">
      {/* Bright premium strip — breaks the all-black page */}
      <div className="relative border-y border-emerald-400/25 bg-gradient-to-r from-emerald-500 via-lime-400 to-emerald-300">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-start justify-between gap-4 px-4 py-5 sm:flex-row sm:items-center sm:px-6 lg:px-10">
          <div>
            <p
              className="text-lg font-extrabold leading-tight text-black sm:text-xl"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
            >
              Ready to download on Telegram?
            </p>
            <p className="mt-0.5 text-sm font-medium text-black/70">
              Premium unlocks the bot. Browse stays free.
            </p>
          </div>
          <Link
            href="/get-access"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-bold text-emerald-300 transition hover:bg-black/90 hover:text-lime-300"
          >
            Get premium
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="relative bg-[#0c1410] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(132,204,22,0.22) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-lime-400/15 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-10 lg:py-14">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <VmcLogo href="/" height={64} />
              <p className="mt-5 text-base leading-7 text-white/80">
                Latest movies and series. No ads. Premium sends the file straight to Telegram.
              </p>
            </div>

            <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-2xl bg-[#2AABEE] px-4 py-4 text-white shadow-lg shadow-[#2AABEE]/25 transition hover:brightness-110"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                  <TelegramIcon className="h-6 w-6" />
                </span>
                <span className="min-w-0 text-left">
                  <span className="block text-sm font-bold">Telegram</span>
                  <span className="block text-xs text-white/85">Join updates</span>
                </span>
                <ArrowUpRight className="ml-auto h-4 w-4 opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-2xl bg-[#25D366] px-4 py-4 text-black shadow-lg shadow-emerald-900/30 transition hover:brightness-110"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/10">
                  <WhatsAppIcon className="h-6 w-6" />
                </span>
                <span className="min-w-0 text-left">
                  <span className="block text-sm font-bold">WhatsApp</span>
                  <span className="block text-xs text-black/70">Join the group</span>
                </span>
                <ArrowUpRight className="ml-auto h-4 w-4 opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>

          <nav className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2.5">
            {NAV.map(({ label, href }, i) => (
              <span key={href} className="inline-flex items-center gap-5">
                {i > 0 && <span className="hidden h-1 w-1 rounded-full bg-emerald-400/50 sm:block" aria-hidden />}
                <Link
                  href={href}
                  className="text-sm font-semibold text-white/75 transition hover:text-lime-300"
                >
                  {label}
                </Link>
              </span>
            ))}
          </nav>

          <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-emerald-400/15 pt-6 sm:flex-row sm:items-center">
            <p className="text-sm text-white/55">© {year} VMC — Vintage Movie Channel</p>
            <p className="text-sm text-white/55">
              Built by{" "}
              <a
                href="https://tobithedev.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-lime-300 underline decoration-lime-300/40 underline-offset-4 transition hover:text-lime-200"
              >
                tobithedev
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
