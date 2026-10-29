"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { FilmSlate, House, MagnifyingGlass, Television, UserCircle } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/cn";

type DockLink = { href: string; label: string; icon: Icon };

export default function MobileDock() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const premium = user?.premiumStatus === "active";
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  // Slide away while scrolling down so artwork gets the full screen; return on any upward scroll.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (Math.abs(delta) < 8) return;
      setHidden(delta > 0 && y > 160);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const left: DockLink[] = [
    { href: "/", label: "Home", icon: House },
    { href: "/movies", label: "Movies", icon: FilmSlate },
  ];
  const right: DockLink[] = [
    { href: "/series", label: "TV Shows", icon: Television },
    // While loading, point at /account (it sends signed-out visitors to log in) instead of flashing "Log in".
    { href: user || loading ? "/account" : "/login", label: user || loading ? "Account" : "Log in", icon: UserCircle },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/movies") return pathname === "/movies" || pathname.startsWith("/movie/");
    if (href === "/series") return pathname === "/series" || pathname.startsWith("/series/");
    return pathname === href;
  };
  const searching = pathname === "/search";

  const renderLink = (item: DockLink) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    const showPremiumDot = premium && item.href === "/account";
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-full px-1 text-[11px] font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300",
          active ? "text-emerald-300" : "text-white/60 active:text-white",
        )}
      >
        {active && (
          <motion.span
            layoutId="dock-active"
            aria-hidden
            className="absolute inset-x-0.5 inset-y-1 rounded-full bg-emerald-400/[0.12] ring-1 ring-inset ring-emerald-400/25"
            transition={{ type: "spring", duration: 0.35, bounce: 0 }}
          />
        )}
        <span className="relative">
          <Icon className="size-[22px]" weight={active ? "fill" : "regular"} />
          {showPremiumDot && (
            <span
              aria-label="Premium active"
              className="absolute -right-1 -top-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-[#101214]"
            />
          )}
        </span>
        <span className="relative">{item.label}</span>
      </Link>
    );
  };

  return (
    <nav
      aria-label="Primary mobile navigation"
      className={cn(
        "fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 transition-transform duration-300 ease-out md:hidden",
        hidden && "translate-y-[calc(100%+1.5rem)]",
      )}
    >
      <div className="mx-auto flex max-w-md items-center gap-1 rounded-full border border-white/10 bg-[#101214]/90 p-1.5 shadow-[0_18px_55px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        {left.map(renderLink)}

        <Link
          href="/search"
          aria-label="Search movies and TV shows"
          aria-current={searching ? "page" : undefined}
          className="relative -my-4 mx-1 flex size-[3.75rem] shrink-0 items-center justify-center rounded-full bg-emerald-400 text-black shadow-[0_10px_30px_rgba(52,211,153,0.35)] ring-4 ring-[#060809] transition-[background-color,scale] duration-200 hover:bg-emerald-300 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300"
        >
          <MagnifyingGlass className="size-6" weight="bold" />
        </Link>

        {right.map(renderLink)}
      </div>
    </nav>
  );
}
