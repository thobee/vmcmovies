"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Clapperboard,
  CreditCard,
  Bell,
  BadgePercent,
  ExternalLink,
  Film,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  ShieldCheck,
  Tv,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { AdminRole } from "@/lib/auth/types";
import { adminRoleLabel, canAdmin, type AdminPermission } from "@/lib/admin/permissions";
import VmcLogo from "@/components/brand/VmcLogo";
import { AdminToastProvider } from "@/components/admin/toast";
import { Arc } from "@/components/loading-ui/arc";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  permission?: AdminPermission;
};

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    section: "Catalog",
    items: [
      { href: "/admin/movies", label: "Movies", icon: Film, permission: "catalog" },
      { href: "/admin/series", label: "Series", icon: Tv, permission: "catalog" },
    ],
  },
  {
    section: "Site",
    items: [
      { href: "/admin/homepage", label: "Homepage", icon: Home, permission: "homepage" },
      { href: "/admin/updates", label: "Updates", icon: Bell, permission: "updates" },
      { href: "/admin/requests", label: "Requests", icon: Clapperboard, permission: "requests" },
      { href: "/admin/users", label: "Users", icon: Users, permission: "users" },
      { href: "/admin/team", label: "Team", icon: ShieldCheck, permission: "team" },
      { href: "/admin/billing", label: "Billing", icon: BadgePercent, permission: "billing" },
      { href: "/admin/payments", label: "Payments", icon: CreditCard, permission: "payments" },
      { href: "/admin/support", label: "Support", icon: MessageCircle, permission: "support" },
    ],
  },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

function NavLinks({
  pathname,
  role,
  onNavigate,
}: {
  pathname: string;
  role: AdminRole;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-5">
      {NAV.map(({ section, items }) => {
        const allowedItems = items.filter((item) => !item.permission || canAdmin(role, item.permission));
        if (allowedItems.length === 0) return null;
        return (
        <div key={section}>
          <p className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/25">
            {section}
          </p>
          <div className="space-y-0.5">
            {allowedItems.map(({ href, label, icon: Icon, exact = false }) => {
              const active = isActive(pathname, href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  className={cn(
                    "relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all",
                    active
                      ? "bg-white/6 text-white"
                      : "text-white/45 hover:text-white hover:bg-white/4"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.75 rounded-full bg-amber" />
                  )}
                  <Icon
                    className={cn("w-4 h-4", active ? "text-amber" : "text-white/30")}
                  />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      );
      })}
    </nav>
  );
}

function BrandMark({ size = "md" }: { size?: "sm" | "md" }) {
  return <VmcLogo height={size === "sm" ? 32 : 44} href="/" />;
}

export default function AdminShell({
  email,
  role,
  children,
}: {
  email: string;
  role: AdminRole;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const closeMenu = () => setMenuOpen(false);

  const sidebarFooter = (
    <div className="p-3 space-y-1 border-t border-white/6">
      <Link
        href="/"
        target="_blank"
        onClick={closeMenu}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-white/45 hover:text-white hover:bg-white/4 transition-colors"
      >
        <ExternalLink className="w-4 h-4 text-white/30" />
        View site
      </Link>

      <div className="flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-xl bg-white/4 border border-white/6">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--amber)/15 text-amber text-[11px] font-bold uppercase">
          {email.charAt(0)}
        </div>
        <p className="flex-1 min-w-0 truncate text-[11px] text-white/45">{email}</p>
        <span className="hidden rounded-full bg-white/6 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white/35 lg:inline">
          {adminRoleLabel(role)}
        </span>
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          aria-busy={loggingOut}
          title="Log out"
          className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/6 transition-colors disabled:cursor-wait disabled:opacity-60"
        >
          {loggingOut ? <Arc className="size-3.5 border-[1.5px]" /> : <LogOut className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );

  return (
    <AdminToastProvider>
    <div className="admin-app min-h-screen flex bg-[#181818]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col sticky top-0 h-screen border-r border-white/6 bg-[#141414]">
        <div className="flex items-center gap-3 px-5 pt-7 pb-8">
          <BrandMark />
          <div>
            <p className="text-white text-sm font-bold leading-tight tracking-tight">VMC Studio</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30 leading-tight mt-0.5">
              Admin console
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3">
          <NavLinks pathname={pathname} role={role} />
        </div>
        {sidebarFooter}
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-50 transition-[visibility] duration-200",
          menuOpen ? "visible" : "invisible"
        )}
      >
        <button
          type="button"
          aria-label="Close menu"
          className={cn(
            "absolute inset-0 bg-black/60 transition-opacity duration-200",
            menuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={closeMenu}
        />
        <aside
          className={cn(
            "absolute left-0 top-0 flex h-full w-[min(18rem,88vw)] flex-col border-r border-white/6 bg-[#141414] shadow-2xl transition-transform duration-200 ease-out",
            menuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between gap-3 px-4 pt-5 pb-6">
            <div className="flex items-center gap-2.5">
              <BrandMark size="sm" />
              <div>
                <p className="text-white text-sm font-bold">VMC Studio</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/30">Admin</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeMenu}
              className="rounded-lg p-2 text-white/45 hover:bg-white/6 hover:text-white"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3">
            <NavLinks pathname={pathname} role={role} onNavigate={closeMenu} />
          </div>
          {sidebarFooter}
        </aside>
      </div>

      <div className="flex-1 min-w-0">
        <header className="md:hidden sticky top-0 z-40 flex items-center justify-between gap-3 px-4 py-3 border-b border-white/6 bg-[#141414]/95 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/7"
            aria-expanded={menuOpen}
          >
            <Menu className="h-4 w-4" />
            Menu
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <BrandMark size="sm" />
            <span className="truncate text-sm font-bold text-white">Admin</span>
          </div>
          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            aria-busy={loggingOut}
            className="rounded-lg p-2 text-white/45 hover:text-white disabled:cursor-wait disabled:opacity-60"
            title="Log out"
          >
            {loggingOut ? <Arc className="size-4 border-[1.5px]" /> : <LogOut className="h-4 w-4" />}
          </button>
        </header>

        <main className="w-full px-4 py-5 sm:px-8 sm:py-8 lg:px-12 lg:py-10">{children}</main>
      </div>
    </div>
    </AdminToastProvider>
  );
}
