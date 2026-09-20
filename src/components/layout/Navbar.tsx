"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { List, User, X } from "@phosphor-icons/react";
import VmcLogo from "@/components/brand/VmcLogo";
import NavbarSearch from "@/components/layout/NavbarSearch";
import NotificationBell from "@/components/layout/NotificationBell";
import RequestButton from "@/components/layout/RequestButton";
import { cn } from "@/lib/cn";
import { useAuth } from "@/components/auth/AuthProvider";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/series", label: "TV Shows" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/movies") return pathname === "/movies" || pathname.startsWith("/movie/");
    if (href === "/series") return pathname === "/series" || pathname.startsWith("/series/");
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
        <div
          className="mx-auto flex h-[68px] max-w-screen-2xl items-center gap-4 rounded-full border border-white/10 bg-[#101214]/85 px-4 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-2xl supports-backdrop-filter:bg-[#101214]/70 sm:px-6 lg:gap-8 lg:px-8"
        >
          <VmcLogo href="/" height={44} priority className="transition-transform hover:scale-[1.02]" />

          <NavbarSearch variant="desktop" className="hidden md:block" />

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-2.5 text-[15px] font-semibold transition-colors duration-200",
                  isActive(item.href) ? "text-white" : "text-white/50 hover:text-white",
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-emerald-400" />
                )}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <RequestButton />
            <NotificationBell />

            {!user && (
              <Link
                href="/signup"
                className="hidden px-3.5 py-2.5 text-sm font-semibold text-white/55 transition hover:text-white md:flex"
              >
                Sign up
              </Link>
            )}
            <Link
              href={user ? "/account" : "/login"}
              aria-label={user ? "Account" : "Log in"}
              className="hidden items-center gap-2 rounded-full bg-emerald-500 px-3 py-2 shadow-sm shadow-emerald-500/25 transition hover:bg-emerald-400 md:inline-flex"
            >
              <User className="h-4.5 w-4.5 shrink-0 text-black" strokeWidth={2.5} />
              <span className="text-xs font-bold text-black">
                {user ? "Account" : "Log in"}
              </span>
            </Link>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white/55 transition hover:bg-white/5 hover:text-white lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-x-0 top-[92px] z-40 origin-top px-3 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] sm:px-4 lg:hidden",
          mobileOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <div className="mx-auto max-w-screen-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#101214]/98 shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
          <div className="px-4 pt-4">
            <NavbarSearch variant="mobile" onNavigate={() => setMobileOpen(false)} />
          </div>

          <nav className="flex flex-col gap-0.5 px-3 py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                {isActive(item.href) && (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                )}
                {item.label}
              </Link>
            ))}
            {user?.premiumStatus === "active" && (
              <div className="px-3 pt-1">
                <RequestButton className="w-full justify-center py-3" />
              </div>
            )}
          </nav>

          <Link
            href={user ? "/account" : "/login"}
            onClick={() => setMobileOpen(false)}
            className="mx-4 mb-4 flex items-center gap-3 border-t border-white/10 pt-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500">
              <User className="h-4 w-4 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">
                {user ? "Account" : "Log in"}
              </p>
              <p className="text-[10px] text-white/35">
                {user ? user.email.split("@")[0] : "Create or access your account"}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
