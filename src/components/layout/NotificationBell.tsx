"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowSquareOut,
  Bell,
  CircleNotch,
  Crown,
  FilmStrip,
  Megaphone,
  Television,
} from "@phosphor-icons/react";
import type { SiteUpdateKind } from "@/lib/site/updates/types";
import { UPDATE_KIND_LABELS } from "@/lib/site/updates/types";
import { timeAgo } from "@/lib/format/timeAgo";
import { cn } from "@/lib/cn";

const READ_IDS_KEY = "vmc_updates_read_ids";

type NotificationItem = {
  id: string;
  kind: string;
  title: string;
  body: string;
  href?: string;
  publishedAt: string;
  source: "site" | "account";
};

function kindIcon(kind: string) {
  if (
    kind === "trial_available" ||
    kind === "premium_expiring" ||
    kind === "premium_expired" ||
    kind === "premium_upsell"
  ) {
    return Crown;
  }
  if (kind === "movie") return FilmStrip;
  if (kind === "series") return Television;
  return Megaphone;
}

function readIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_IDS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(READ_IDS_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }
}

export default function NotificationBell() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [readSet, setReadSet] = useState<Set<string>>(() => new Set());
  const [mounted, setMounted] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setItems((data.items as NotificationItem[]) ?? []);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const readyTimer = window.setTimeout(() => {
      setReadSet(readIds());
      setMounted(true);
      void load();
    }, 0);
    const timer = window.setInterval(load, 5 * 60 * 1000);
    return () => {
      window.clearTimeout(readyTimer);
      window.clearInterval(timer);
    };
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const markRead = (id: string) => {
    setReadSet((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  };

  const markAllRead = () => {
    const next = new Set(readSet);
    for (const item of items) next.add(item.id);
    setReadSet(next);
    saveReadIds(next);
  };

  const unread = mounted ? items.filter((u) => !readSet.has(u.id)).length : 0;

  const onItemOpen = (id: string) => {
    markRead(id);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread > 0 ? `${unread} new updates` : "Site updates"}
        aria-expanded={open}
        suppressHydrationWarning
        className={cn(
          "relative flex items-center gap-2 rounded-xl px-2.5 py-2 transition sm:px-3",
          open
            ? "bg-emerald-500/15 text-emerald-300"
            : "text-white/50 hover:bg-white/5 hover:text-white",
        )}
      >
        <Bell className="h-4.5 w-4.5 shrink-0" weight="bold" />
        <span className="hidden text-xs font-semibold sm:inline">Updates</span>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-black shadow-sm shadow-emerald-500/40">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-x-3 top-[88px] z-[70] max-h-[calc(100dvh-104px)] overflow-hidden rounded-2xl border border-white/10 bg-[#101214] shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+10px)] sm:w-80 sm:max-h-none"
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3.5">
            <div>
              <p className="text-sm font-bold text-white">Updates</p>
              <p className="text-[11px] text-white/45">Updates & your account</p>
            </div>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-300 transition hover:bg-emerald-500/25"
              >
                Mark all read
              </button>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-white/45">
              <CircleNotch className="h-4 w-4 animate-spin text-emerald-400" weight="bold" />
              Loading…
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-semibold text-white/75">No updates yet</p>
              <p className="mt-1 text-xs leading-5 text-white/45">
                Check back for new movies, series, and site news.
              </p>
            </div>
          )}

          {!loading && items.length > 0 && (
            <ul className="max-h-[calc(100dvh-220px)] overflow-y-auto sm:max-h-[min(60vh,380px)]">
              {items.map((item) => {
                const Icon = kindIcon(item.kind);
                const isUnread = !readSet.has(item.id);
                const isPremium = item.source === "account";
                const inner = (
                  <>
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                        isPremium && "bg-amber-500/15 text-amber-300",
                        !isPremium && item.kind === "movie" && "bg-emerald-500/15 text-emerald-400",
                        !isPremium && item.kind === "series" && "bg-sky-500/15 text-sky-300",
                        !isPremium &&
                          (item.kind === "news" || item.kind === "general") &&
                          "bg-amber-500/15 text-amber-300",
                      )}
                    >
                      <Icon className="h-4 w-4" weight="bold" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm font-semibold leading-snug",
                            isUnread ? "text-white" : "text-white/75",
                          )}
                        >
                          {item.title}
                        </p>
                        {isUnread && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-white/35">
                        {isPremium ? "Your account" : UPDATE_KIND_LABELS[item.kind as SiteUpdateKind] ?? item.kind}
                      </p>
                      <p
                        className={cn(
                          "mt-1 line-clamp-2 text-xs leading-5",
                          isUnread ? "text-white/55" : "text-white/40",
                        )}
                      >
                        {item.body}
                      </p>
                      <p className="mt-1.5 text-[10px] text-white/35">{timeAgo(item.publishedAt)}</p>
                    </div>
                  </>
                );

                const isExternal = item.href?.startsWith("http") ?? false;
                const rowClass = cn(
                  "flex gap-3 px-4 py-3.5 transition",
                  isUnread ? "hover:bg-white/4" : "opacity-90 hover:bg-white/3",
                );

                return (
                  <li key={item.id} className="border-b border-white/6 last:border-0">
                    {item.href ? (
                      isExternal ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => onItemOpen(item.id)}
                          className={rowClass}
                        >
                          {inner}
                          <ArrowSquareOut className="mt-1 h-3.5 w-3.5 shrink-0 text-white/25" weight="bold" />
                        </a>
                      ) : (
                        <Link href={item.href} onClick={() => onItemOpen(item.id)} className={rowClass}>
                          {inner}
                          <ArrowSquareOut className="mt-1 h-3.5 w-3.5 shrink-0 text-white/25" weight="bold" />
                        </Link>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => markRead(item.id)}
                        className={cn(rowClass, "w-full text-left")}
                      >
                        {inner}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
