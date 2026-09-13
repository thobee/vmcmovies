"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { useAdminToast } from "@/components/admin/toast";
import type { PremiumStatus } from "@/lib/auth/types";

export interface AdminUserRow {
  _id: string;
  email: string;
  telegramUsername: string;
  premiumStatus: PremiumStatus;
  premiumExpiryDate: string | null;
  createdAt: string;
}

const STATUS_OPTIONS: { value: PremiumStatus; label: string }[] = [
  { value: "none", label: "Free" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
];

const STATUS_BADGE: Record<PremiumStatus, string> = {
  none: "bg-white/[0.07] text-white/55 border-white/10",
  pending: "bg-amber-500/12 text-amber-200 border-amber-500/25",
  active: "bg-emerald-500/12 text-emerald-300 border-emerald-500/25",
  expired: "bg-red-500/12 text-red-300 border-red-500/25",
};

const AVATAR_COLORS = [
  "bg-[var(--amber)]/25 text-[var(--amber-100,#c9dcff)]",
  "bg-emerald-500/20 text-emerald-200",
  "bg-purple-500/20 text-purple-200",
  "bg-rose-500/20 text-rose-200",
  "bg-cyan-500/20 text-cyan-200",
];

function avatarColor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function UsersTable({ users }: { users: AdminUserRow[] }) {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [savingId, setSavingId] = useState<string | null>(null);

  const updateStatus = async (user: AdminUserRow, premiumStatus: PremiumStatus) => {
    setSavingId(user._id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, premiumStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast({ title: "Couldn’t update user", message: data.error, tone: "error" });
        return;
      }
      const label = STATUS_OPTIONS.find((o) => o.value === premiumStatus)?.label ?? premiumStatus;
      toast({ title: "User updated", message: `${user.email} → ${label}` });
      router.refresh();
    } catch {
      toast({ title: "Network error", tone: "error" });
    } finally {
      setSavingId(null);
    }
  };

  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-[#1a1a1a] px-6 py-16 text-center">
        <p className="text-sm text-white/45">
          No registered users yet. They&apos;ll appear here after signing up on the site.
        </p>
      </div>
    );
  }

  const StatusSelect = ({ user }: { user: AdminUserRow }) => (
    <select
      value={user.premiumStatus}
      disabled={savingId === user._id}
      onChange={(e) => updateStatus(user, e.target.value as PremiumStatus)}
      className="w-full rounded-lg field px-2.5 py-2 text-base sm:text-xs text-white disabled:opacity-50"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );

  return (
    <>
      <div className="md:hidden space-y-3">
        {users.map((user) => (
          <article key={user._id} className="rounded-2xl panel p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase",
                  avatarColor(user.email)
                )}
              >
                {user.email.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white truncate">{user.email}</p>
                <p className="text-[11px] text-white/40">@{user.telegramUsername}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase",
                  STATUS_BADGE[user.premiumStatus]
                )}
              >
                {user.premiumStatus}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[11px] text-white/35">
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              {user.premiumExpiryDate && user.premiumStatus === "active" && (
                <span>until {new Date(user.premiumExpiryDate).toLocaleDateString()}</span>
              )}
            </div>
            <StatusSelect user={user} />
          </article>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto rounded-2xl panel">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-[0.14em] text-white/35">
              <th className="px-5 py-3.5 font-semibold w-[32%]">User</th>
              <th className="px-5 py-3.5 font-semibold w-[18%]">Telegram</th>
              <th className="px-5 py-3.5 font-semibold w-[16%]">Premium</th>
              <th className="px-5 py-3.5 font-semibold w-[14%]">Joined</th>
              <th className="px-5 py-3.5 font-semibold w-[20%]">Set status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.025] transition-colors"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold uppercase",
                        avatarColor(user.email)
                      )}
                    >
                      {user.email.charAt(0)}
                    </div>
                    <p className="font-medium text-white truncate">{user.email}</p>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-white/50">@{user.telegramUsername}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                      STATUS_BADGE[user.premiumStatus]
                    )}
                  >
                    {user.premiumStatus}
                  </span>
                  {user.premiumExpiryDate && user.premiumStatus === "active" && (
                    <p className="mt-1 text-[10px] text-white/35">
                      until {new Date(user.premiumExpiryDate).toLocaleDateString()}
                    </p>
                  )}
                </td>
                <td className="px-5 py-3.5 text-white/45 text-xs">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3.5">
                  <StatusSelect user={user} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
