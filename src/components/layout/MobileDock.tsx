"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FilmSlate, House, Television, UserCircle } from "@phosphor-icons/react";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/cn";

const PRIMARY_LINKS = [
  { href: "/", label: "Home", icon: House },
  { href: "/movies", label: "Movies", icon: FilmSlate },
  { href: "/series", label: "TV Shows", icon: Television },
] as const;

export default function MobileDock() {
  const pathname = usePathname();
  const { user } = useAuth();
  const accountHref = user ? "/account" : "/login";
  const links = [
    ...PRIMARY_LINKS,
    { href: accountHref, label: user ? "Account" : "Log in", icon: UserCircle },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/movies") return pathname === "/movies" || pathname.startsWith("/movie/");
    if (href === "/series") return pathname === "/series" || pathname.startsWith("/series/");
    return pathname === href;
  };

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 rounded-[1.35rem] border border-white/10 bg-[#101214]/92 p-1.5 shadow-[0_18px_55px_rgba(0,0,0,0.6)] backdrop-blur-2xl supports-backdrop-filter:bg-[#101214]/82">
        {links.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-xs font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300",
                active
                  ? "bg-emerald-400 text-black"
                  : "text-white/70 hover:bg-white/[0.06] hover:text-white",
              )}
            >
              <Icon className="size-5" weight={active ? "fill" : "regular"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
