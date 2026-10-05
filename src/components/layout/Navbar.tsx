"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CaretDown, List, SignOut, SquaresFour, User, X } from "@phosphor-icons/react";
import VmcLogo from "@/components/brand/VmcLogo";
import NavbarSearch from "@/components/layout/NavbarSearch";
import NotificationBell from "@/components/layout/NotificationBell";
import RequestButton from "@/components/layout/RequestButton";
import { cn } from "@/lib/cn";
import { useAuth } from "@/components/auth/AuthProvider";
import { Arc } from "@/components/loading-ui/arc";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/series", label: "TV Shows" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accountOpen) return;
    const close = (event: PointerEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [accountOpen]);

  const logout = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setAccountOpen(false);
      setMobileOpen(false);
      router.push("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

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
          <VmcLogo
            href="/"
            height={44}
            priority
            className="transition-transform hover:scale-[1.02]"
          />

          <NavbarSearch variant="desktop" className="hidden md:block" />

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
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
            <RequestButton compact className="hidden md:inline-flex" />
            <NotificationBell />

            {!user && (
              <Link
                href="/signup"
                className="hidden px-3.5 py-2.5 text-sm font-semibold text-white/55 transition hover:text-white md:flex"
              >
                Sign up
              </Link>
            )}
            {user ? (
              <div ref={accountRef} className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  aria-label="Open account menu"
                  aria-expanded={accountOpen}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 py-2 pl-3 pr-2.5 shadow-sm shadow-emerald-500/25 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-emerald-400"
                >
                  <User className="h-4.5 w-4.5 shrink-0 text-black" weight="bold" />
                  <span className="text-xs font-bold text-black">Account</span>
                  <CaretDown
                    className={cn(
                      "h-3.5 w-3.5 text-black/65 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                      accountOpen && "rotate-180",
                    )}
                    weight="bold"
                  />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#101214] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
                    <div className="border-b border-white/[0.07] px-3 py-2.5">
                      <p className="truncate text-xs font-semibold text-white">{user.email}</p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-emerald-300/70">
                        {user.premiumStatus === "active" ? "Premium member" : "VMC member"}
                      </p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setAccountOpen(false)}
                      className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/[0.06] hover:text-white"
                    >
                      <SquaresFour className="h-4 w-4 text-emerald-300" weight="light" />
                      User dashboard
                    </Link>
                    <button
                      type="button"
                      disabled={signingOut}
                      onClick={logout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-white/55 transition hover:bg-red-500/10 hover:text-red-200 disabled:cursor-wait disabled:opacity-60"
                    >
                      {signingOut ? (
                        <Arc className="size-4 border-[2px]" />
                      ) : (
                        <SignOut className="h-4 w-4" weight="light" />
                      )}
                      {signingOut ? "Signing out..." : "Log out"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                aria-label="Log in"
                className="hidden items-center gap-2 rounded-full bg-emerald-500 px-3 py-2 shadow-sm shadow-emerald-500/25 transition hover:bg-emerald-400 md:inline-flex"
              >
                <User className="h-4.5 w-4.5 shrink-0 text-black" weight="bold" />
                <span className="text-xs font-bold text-black">Log in</span>
              </Link>
            )}

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
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
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
                onClick={() => setMobileOpen(false)}
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

          <div className="mx-4 mb-4 border-t border-white/10 pt-3">
            <Link
              href={user ? "/account" : "/login"}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/[0.05]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                {user ? (
                  <SquaresFour className="h-4 w-4 text-black" weight="bold" />
                ) : (
                  <User className="h-4 w-4 text-black" weight="bold" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white">
                  {user ? "Open user dashboard" : "Log in"}
                </p>
                <p className="truncate text-[10px] text-white/35">
                  {user ? user.email : "Create or access your account"}
                </p>
              </div>
            </Link>
            {user && (
              <button
                type="button"
                disabled={signingOut}
                onClick={logout}
                className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/55 transition hover:bg-red-500/10 hover:text-red-200 disabled:cursor-wait disabled:opacity-60"
              >
                {signingOut ? <Arc className="size-4 border-[2px]" /> : <SignOut className="h-4 w-4" weight="light" />}
                {signingOut ? "Signing out..." : "Log out"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
