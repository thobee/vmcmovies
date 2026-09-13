import { listUsers } from "@/lib/auth/users";
import { listUserAlerts } from "@/lib/admin/user-alerts";
import UsersSection from "@/components/admin/UsersSection";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminUsersPage() {
  let users: Awaited<ReturnType<typeof listUsers>> = [];
  let alerts: Awaited<ReturnType<typeof listUserAlerts>> = [];

  try {
    users = await listUsers();
    alerts = await listUserAlerts(users);
  } catch {
    users = [];
    alerts = [];
  }

  const premiumCount = users.filter((u) => u.premiumStatus === "active").length;

  return (
    <div>
      <AdminPageHeader
        title="Users"
        badge={`${users.length} registered · ${premiumCount} premium`}
        subtitle="Manage accounts, and check alerts for new subscriptions or expired plans."
      />
      <UsersSection users={users} alerts={alerts} />
    </div>
  );
}
