"use client";

import { useState } from "react";
import { Bell, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import UsersTable, { type AdminUserRow } from "@/components/admin/UsersTable";
import UserAlertsPanel from "@/components/admin/UserAlertsPanel";
import type { UserAlert } from "@/lib/admin/user-alerts";

type Tab = "users" | "alerts";

export default function UsersSection({
  users,
  alerts,
}: {
  users: AdminUserRow[];
  alerts: UserAlert[];
}) {
  const [tab, setTab] = useState<Tab>("users");

  return (
    <div>
      <div className="mb-5 flex gap-1.5 rounded-xl border border-white/[0.06] bg-[#141414] p-1 w-full sm:w-auto sm:inline-flex">
        <TabButton
          active={tab === "users"}
          onClick={() => setTab("users")}
          icon={Users}
          label="Users"
          count={users.length}
        />
        <TabButton
          active={tab === "alerts"}
          onClick={() => setTab("alerts")}
          icon={Bell}
          label="Alerts"
          count={alerts.length}
          highlight={alerts.length > 0}
        />
      </div>

      {tab === "users" ? <UsersTable users={users} /> : <UserAlertsPanel alerts={alerts} />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
  highlight,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Users;
  label: string;
  count: number;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-white/[0.08] text-white"
          : "text-white/45 hover:text-white/75 hover:bg-white/[0.03]"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
          active
            ? "bg-white/[0.1] text-white/70"
            : highlight
              ? "bg-white/[0.08] text-white/60"
              : "bg-white/[0.04] text-white/35"
        )}
      >
        {count}
      </span>
    </button>
  );
}
