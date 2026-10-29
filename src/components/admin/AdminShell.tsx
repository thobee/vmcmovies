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
  Plus,
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
          <p className="px-3 mb-2 text-xs md:text-[11px] font-bold uppercase tracking-[0.16em] text-white/55">
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
                    "relative flex min-h-12 items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium transition-colors md:min-h-0 md:gap-2.5 md:py-2.5 md:rounded-lg md:text-[13px]",
                    active
                      ? "bg-white/8 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.75 rounded-full bg-amber" />
                  )}
                  <Icon
                    className={cn("size-5 md:size-4", active ? "text-amber" : "text-white/55")}
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

function currentTitle(pathname: string): string {
  if (/\/(movies|series)\/new$/.test(pathname)) return pathname.includes("/movies") ? "New movie" : "New series";
  if (/\/edit$/.test(pathname)) return "Edit title";
  for (const { items } of NAV) {
    for (const item of items) {
      if (isActive(pathname, item.href, item.exact)) return item.label;
    }
  }
  return "Admin";
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
  const [addOpen, setAddOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const canCatalog = canAdmin(role, "catalog");
  // Add/edit forms have their own sticky Save bar at the bottom; the tab bar would cover it.
  const onFormPage = /\/(new|edit)$/.test(pathname);
  const showTabBar = !onFormPage;

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

  const tab = (href: string, label: string, Icon: React.ComponentType<{ className?: string }>, exact = false) => {
    const active = isActive(pathname, href, exact);
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold transition-colors",
          active ? "bg-white/8 text-amber" : "text-white/70 active:bg-white/5",
        )}
      >
        <Icon className="size-[22px]" />
        {label}
      </Link>
    );
  };

  const sidebarFooter = (
    <div className="p-3 space-y-1 border-t border-white/6">
      <Link
        href="/"
        target="_blank"
        onClick={closeMenu}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-white/60 hover:text-white hover:bg-white/4 transition-colors"
      >
        <ExternalLink className="w-4 h-4 text-white/60" />
        View site
      </Link>

      <div className="flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-xl bg-white/4 border border-white/6">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--amber)/15 text-amber text-[12px] font-bold uppercase">
          {email.charAt(0)}
        </div>
        <p className="flex-1 min-w-0 truncate text-[12px] text-white/60">{email}</p>
        <span className="hidden rounded-full bg-white/6 px-2 py-0.5 text-[12px] font-bold uppercase tracking-wide text-white/60 lg:inline">
          {adminRoleLabel(role)}
        </span>
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          aria-busy={loggingOut}
          title="Log out"
          className="grid size-11 place-items-center rounded-lg text-white/60 hover:text-white hover:bg-white/6 transition-colors disabled:cursor-wait disabled:opacity-60 md:size-auto md:p-1.5"
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
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/60 leading-tight mt-0.5">
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
          "md:hidden fixed inset-0 z-[60] transition-[visibility] duration-200", // above the phone tab bar
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
                <p className="text-[12px] uppercase tracking-[0.14em] text-white/60">Admin</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeMenu}
              className="grid size-11 place-items-center rounded-xl text-white/70 hover:bg-white/6 hover:text-white"
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
        <header className="md:hidden sticky top-0 z-40 flex h-16 items-center gap-3 px-3 border-b border-white/8 bg-[#141414]">
          <BrandMark size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] font-bold leading-tight text-white">{currentTitle(pathname)}</p>
            <p className="text-xs leading-tight text-white/55">VMC Studio · {adminRoleLabel(role)}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            aria-busy={loggingOut}
            aria-label="Log out"
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/75 hover:text-white disabled:cursor-wait disabled:opacity-60"
          >
            {loggingOut ? <Arc className="size-4 border-[1.5px]" /> : <LogOut className="size-5" />}
          </button>
        </header>

        <main className={cn("w-full px-4 py-5 sm:px-8 sm:py-8 lg:px-12 lg:py-10", showTabBar && "pb-32 md:pb-10")}>{children}</main>

        {/* Phone tab bar: the screens you use most, plus a big Add button for new media. */}
        {showTabBar && (
          <>
            {addOpen && (
              <button
                type="button"
                aria-label="Close add menu"
                className="md:hidden fixed inset-0 z-40 bg-black/60"
                onClick={() => setAddOpen(false)}
              />
            )}
            {addOpen && canCatalog && (
              <div className="md:hidden fixed inset-x-3 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-50 grid gap-2 rounded-3xl border border-white/10 bg-[#1e1e1e] p-3 shadow-2xl">
                <p className="px-2 pt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/55">Add new</p>
                <Link
                  href="/admin/movies/new"
                  onClick={() => setAddOpen(false)}
                  className="flex min-h-14 items-center gap-3 rounded-2xl bg-white/[0.05] px-4 text-base font-semibold text-white active:bg-white/10"
                >
                  <Film className="size-6 text-amber" />
                  New movie
                </Link>
                <Link
                  href="/admin/series/new"
                  onClick={() => setAddOpen(false)}
                  className="flex min-h-14 items-center gap-3 rounded-2xl bg-white/[0.05] px-4 text-base font-semibold text-white active:bg-white/10"
                >
                  <Tv className="size-6 text-amber" />
                  New series
                </Link>
              </div>
            )}
            <nav
              aria-label="Admin quick navigation"
              className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-white/8 bg-[#141414] px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
            >
              <div className="mx-auto flex max-w-lg items-center gap-1">
                {tab("/admin", "Home", LayoutDashboard, true)}
                {canCatalog && tab("/admin/movies", "Movies", Film)}
                {canCatalog && (
                  <button
                    type="button"
                    onClick={() => setAddOpen((open) => !open)}
                    aria-expanded={addOpen}
                    aria-label="Add new movie or series"
                    className="mx-1 grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--amber)] text-black shadow-lg shadow-[var(--amber)]/25 transition-[scale] active:scale-95"
                  >
                    {addOpen ? <X className="size-7" /> : <Plus className="size-7" />}
                  </button>
                )}
                {canCatalog && tab("/admin/series", "Series", Tv)}
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  aria-expanded={menuOpen}
                  className="flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold text-white/70 active:bg-white/5"
                >
                  <Menu className="size-[22px]" />
                  Menu
                </button>
              </div>
            </nav>
          </>
        )}
      </div>
    </div>
    </AdminToastProvider>
  );
}
