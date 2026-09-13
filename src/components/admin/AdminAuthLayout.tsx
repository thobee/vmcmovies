import Link from "next/link";
import type { ReactNode } from "react";
import VmcLogo from "@/components/brand/VmcLogo";

export default function AdminAuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="admin-app relative min-h-screen bg-[#181818] overflow-hidden text-[#e4e4e4]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 10% 0%, rgba(91,141,239,0.10), transparent 55%)",
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/[0.06] bg-[#1e1e1e] shadow-[0_24px_80px_rgba(0,0,0,0.55)] lg:grid-cols-[1.05fr_1fr]">
          <aside className="relative hidden flex-col justify-between bg-[#141414] p-10 lg:flex border-r border-white/[0.06]">
            <div className="relative">
              <VmcLogo href="/" height={52} admin />
            </div>
            <div className="relative max-w-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">
                Staff access
              </p>
              <h2
                className="mt-3 text-3xl font-bold leading-tight text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Manage catalogue, payments, and subscribers.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/45">
                Sign in with your admin account. This area is separate from public site login.
              </p>
            </div>
            <p className="relative text-xs text-white/30">Vintage Movie Channel</p>
          </aside>

          <div className="relative p-6 sm:p-10 bg-[#1e1e1e]">
            <div className="mb-8 lg:hidden">
              <VmcLogo href="/" height={44} admin />
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">
              {eyebrow}
            </p>
            <h1
              className="mt-2 text-3xl font-bold text-white"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
            >
              {title}
            </h1>
            <p className="mt-2 mb-8 text-sm leading-relaxed text-white/45">{subtitle}</p>

            {children}

            <div className="mt-6 text-center text-sm text-white/40">{footer}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
