"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Search, ShieldCheck, ShieldMinus, UserCog } from "lucide-react";
import { cn } from "@/lib/cn";
import { inputClass } from "@/components/admin/form";
import { useAdminToast } from "@/components/admin/toast";
import type { TeamUser } from "@/lib/auth/users";
import type { UserRole } from "@/lib/auth/types";

const ROLE_OPTIONS: { value: UserRole; label: string; help: string }[] = [
  { value: "user", label: "User", help: "No admin access" },
  { value: "content_admin", label: "Content admin", help: "Movies, series, homepage, updates, requests, support" },
  { value: "admin", label: "Full admin", help: "Everything, including team, users, billing, payments" },
];

function roleLabel(role: UserRole) {
  return ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role;
}

function roleBadge(role: UserRole) {
  if (role === "admin") return "border-emerald-500/25 bg-emerald-500/12 text-emerald-300";
  if (role === "content_admin") return "border-amber-500/25 bg-amber-500/12 text-amber-200";
  return "border-white/10 bg-white/[0.05] text-white/45";
}

export default function TeamManager({
  initialUsers,
  currentAdminId,
}: {
  initialUsers: TeamUser[];
  currentAdminId: string;
}) {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const admins = useMemo(() => users.filter((user) => user.role !== "user"), [users]);

  const search = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/team?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Couldn’t search team", message: data.error, tone: "error" });
        return;
      }
      setUsers(data.users);
    } catch {
      toast({ title: "Network error", tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (user: TeamUser, role: UserRole) => {
    setSavingId(user._id);
    try {
      const res = await fetch("/api/admin/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "role", userId: user._id, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Role not changed", message: data.error, tone: "error" });
        return;
      }
      setUsers((items) => items.map((item) => (item._id === user._id ? data.user : item)));
      toast({ title: "Role updated", message: `${user.email} is now ${roleLabel(role)}` });
      router.refresh();
    } catch {
      toast({ title: "Network error", tone: "error" });
    } finally {
      setSavingId(null);
    }
  };

  const resetMfa = async (user: TeamUser) => {
    setSavingId(user._id);
    try {
      const res = await fetch("/api/admin/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_mfa", userId: user._id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "MFA not reset", message: data.error, tone: "error" });
        return;
      }
      setUsers((items) => items.map((item) => (item._id === user._id ? data.user : item)));
      toast({
        title: "Authenticator reset",
        message: `${user.email} will scan a new QR code on next admin login.`,
      });
      router.refresh();
    } catch {
      toast({ title: "Network error", tone: "error" });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl panel p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
              Mini admin instructions
            </p>
            <h2 className="mt-1 text-lg font-bold text-white">How a content admin logs in</h2>
            <ol className="mt-3 space-y-2 text-sm leading-6 text-white/55">
              <li>1. They create a normal account at <span className="text-white">/signup</span>.</li>
              <li>2. You search their email here and change role to <span className="text-white">Content admin</span>.</li>
              <li>3. They open <span className="text-white">/admin/login</span>, not /login.</li>
              <li>4. First admin login asks them to scan an authenticator QR code and save recovery codes.</li>
            </ol>
          </div>
          <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/10 p-4">
            <p className="text-sm font-semibold text-emerald-100">Full admin access</p>
            <p className="mt-2 text-sm leading-6 text-emerald-100/70">
              Yes. Full admins can enter every content-admin section too. Content admins cannot
              access Team, Users, Billing, Payments, or finance tools.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl panel p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Find account</p>
            <p className="mt-1 text-xs text-white/40">
              Search existing users by email, then assign the right admin role.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void search()}
              placeholder="editor@email.com"
              className={cn(inputClass, "sm:w-72")}
            />
            <button
              type="button"
              onClick={() => void search()}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--amber)] px-4 text-sm font-bold text-white disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Stat label="Full admins" value={users.filter((user) => user.role === "admin").length} icon={ShieldCheck} />
        <Stat label="Content admins" value={users.filter((user) => user.role === "content_admin").length} icon={UserCog} />
        <Stat label="Admin accounts" value={admins.length} icon={KeyRound} />
      </div>

      <section className="overflow-hidden rounded-2xl panel">
        <div className="border-b border-white/[0.06] px-4 py-3 sm:px-5">
          <p className="text-sm font-semibold text-white">Accounts</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-[0.14em] text-white/35">
                <th className="px-5 py-3.5 font-semibold">Account</th>
                <th className="px-5 py-3.5 font-semibold">Current role</th>
                <th className="px-5 py-3.5 font-semibold">MFA</th>
                <th className="px-5 py-3.5 font-semibold">Change role</th>
                <th className="px-5 py-3.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = user._id === currentAdminId;
                const busy = savingId === user._id;
                return (
                  <tr key={user._id} className="border-b border-white/[0.04] last:border-0">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{user.email}</p>
                      <p className="mt-0.5 text-xs text-white/35">
                        @{user.telegramUsername} · joined {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide", roleBadge(user.role))}>
                        {roleLabel(user.role)}
                      </span>
                      {isSelf && <p className="mt-1 text-[10px] text-white/35">You</p>}
                    </td>
                    <td className="px-5 py-4 text-white/50">
                      {user.role === "user" ? "No admin MFA" : user.totpEnabled ? "Enabled" : "Needs setup"}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={user.role}
                        disabled={busy || isSelf}
                        onChange={(e) => updateRole(user, e.target.value as UserRole)}
                        className="w-full rounded-lg field px-2.5 py-2 text-xs text-white disabled:opacity-50"
                      >
                        {ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => resetMfa(user)}
                        disabled={busy || user.role === "user"}
                        className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-semibold text-white/60 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldMinus className="h-3.5 w-3.5" />}
                        Reset MFA
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof ShieldCheck;
}) {
  return (
    <div className="rounded-2xl panel p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--amber)]/12 text-[var(--amber)]">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-bold tabular-nums text-white">{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-white/35">{label}</p>
    </div>
  );
}
