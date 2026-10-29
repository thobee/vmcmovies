"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { BookOpen, CaretDown, Crown, FilmSlate, House, List, Question, SignOut, SquaresFour, Television, User, X } from "@phosphor-icons/react";
import VmcLogo from "@/components/brand/VmcLogo";
import NavbarSearch from "@/components/layout/NavbarSearch";
import NotificationBell from "@/components/layout/NotificationBell";
import RequestButton from "@/components/layout/RequestButton";
import { cn } from "@/lib/cn";
import { useAuth } from "@/components/auth/AuthProvider";
import { Arc } from "@/components/loading-ui/arc";

const NAV = [
  { href: "/", label: "Home", icon: House },
  { href: "/movies", label: "Movies", icon: FilmSlate },
  { href: "/series", label: "TV Shows", icon: Television },
];

const MORE_LINKS = [
  { href: "/get-access", label: "Premium plans", icon: Crown },
  { href: "/guide", label: "Download guide", icon: BookOpen },
  { href: "/support", label: "Help & support", icon: Question },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, setUser } = useAuth();
  const premium = user?.premiumStatus === "active";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(false);

  // Solid bar once content scrolls under it; lighter over the hero at the top.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen && !accountOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (mobileOpen) menuButtonRef.current?.focus();
      else accountRef.current?.querySelector("button")?.focus();
      setMobileOpen(false);
      setAccountOpen(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [mobileOpen, accountOpen]);

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
          className={cn(
            "mx-auto flex h-[68px] max-w-screen-2xl items-center gap-1.5 rounded-[24px] border px-3 backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300 sm:gap-3 sm:rounded-full sm:px-5 xl:gap-6 xl:px-7",
            scrolled
              ? "border-white/[0.12] bg-[#0d0f11] shadow-[0_12px_40px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)]"
              : "border-white/10 bg-[#101214]/80 shadow-[0_8px_32px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.04)]",
          )}
        >
          <VmcLogo
            href="/"
            height={44}
            priority
            className="shrink-0 transition-transform hover:scale-[1.02]"
          />

          <NavbarSearch variant="desktop" className="hidden min-w-0 md:block md:flex-1 md:max-w-72 lg:max-w-56 xl:max-w-72" />

          <nav aria-label="Main navigation" className="hidden shrink-0 items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "relative inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-emerald-300",
                  isActive(item.href) ? "text-emerald-300" : "text-white/60 hover:text-white",
                )}
              >
                {isActive(item.href) && (
                  <motion.span
                    layoutId="nav-active"
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-emerald-400/[0.12] ring-1 ring-inset ring-emerald-400/25"
                    transition={{ type: "spring", duration: 0.35, bounce: 0 }}
                  />
                )}
                <span className="relative">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <RequestButton compact className="hidden md:inline-flex" />
            {user && !premium && (
              <Link
                href="/get-access"
                className="hidden min-h-11 items-center gap-2 rounded-full px-4 text-sm font-bold text-emerald-300 ring-1 ring-inset ring-emerald-400/40 transition-colors duration-200 hover:bg-emerald-400/10 md:inline-flex"
              >
                <Crown className="h-4 w-4" weight="fill" />
                <span className="hidden lg:inline">Get Premium</span>
                <span className="lg:hidden">Premium</span>
              </Link>
            )}
            <NotificationBell />

            {!user && !authLoading && (
              <Link
                href="/signup"
                className="hidden px-3.5 py-2.5 text-sm font-semibold text-white/55 transition hover:text-white md:flex"
              >
                Sign up
              </Link>
            )}
            {authLoading ? (
              // Same footprint as the account button, so nothing jumps once we know who you are.
              <span aria-hidden className="hidden h-11 w-32 animate-pulse rounded-full bg-white/[0.06] md:block" />
            ) : user ? (
              <div ref={accountRef} className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  aria-label="Open account menu"
                  aria-expanded={accountOpen}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/[0.06] py-1.5 pl-1.5 pr-3 ring-1 ring-inset ring-white/10 transition-colors duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-sm font-bold uppercase text-white ring-2",
                      premium ? "ring-emerald-400" : "ring-white/15",
                    )}
                  >
                    {user.email.charAt(0)}
                  </span>
                  <span className="text-xs font-semibold text-white/80">{premium ? "Premium" : "Account"}</span>
                  <CaretDown
                    className={cn(
                      "h-3.5 w-3.5 text-white/55 transition-transform duration-200",
                      accountOpen && "rotate-180",
                    )}
                    weight="bold"
                  />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#101214] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
                    <div className="border-b border-white/[0.07] px-3 py-2.5">
                      <p className="truncate text-xs font-semibold text-white">{user.email}</p>
                      <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-emerald-300/70">
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
                className="hidden min-h-11 items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 transition hover:bg-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 md:inline-flex"
              >
                <User className="h-4.5 w-4.5 shrink-0 text-black" weight="bold" />
                <span className="text-xs font-bold text-black">Log in</span>
              </Link>
            )}

            <button
              ref={menuButtonRef}
              type="button"
              className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-white/[0.06] px-3 text-white/75 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-300 lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              aria-controls="public-mobile-menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
              <span className="hidden text-xs font-semibold min-[360px]:inline">{mobileOpen ? "Close" : "Menu"}</span>
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <button type="button" tabIndex={-1} aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-black/55 lg:hidden" />
      )}
      <div
        id="public-mobile-menu"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
        className={cn(
          "fixed inset-x-0 top-[92px] z-40 origin-top px-3 transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] sm:px-4 lg:hidden",
          mobileOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <div className="mx-auto max-h-[calc(100dvh-188px-env(safe-area-inset-bottom))] max-w-screen-2xl overflow-y-auto overscroll-contain rounded-3xl border border-white/10 bg-[#101214] shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
          <nav aria-label="Mobile menu" className="grid grid-cols-2 gap-1 px-3 pb-3 pt-4">
            {[...NAV, ...MORE_LINKS].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex min-h-12 items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                  // Phones get these from the bottom bar; tablets (no bottom bar) still need them here.
                  NAV.some((nav) => nav.href === item.href) && "max-md:hidden",
                  isActive(item.href)
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" weight={isActive(item.href) ? "fill" : "regular"} />
                {item.label}
              </Link>
            ))}
            {user?.premiumStatus === "active" && (
              <div className="col-span-2 px-3 pt-1">
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
                <p className="truncate text-[11px] text-white/55">
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
