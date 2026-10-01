import { redirect } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TeamManager from "@/components/admin/TeamManager";
import { getAdminSession } from "@/lib/admin/session";
import { canAdmin } from "@/lib/admin/permissions";
import { listTeamUsers } from "@/lib/auth/users";

export default async function AdminTeamPage() {
  const session = await getAdminSession();
  if (!session || !canAdmin(session.role, "team")) redirect("/admin");

  let users: Awaited<ReturnType<typeof listTeamUsers>> = [];
  try {
    users = await listTeamUsers();
  } catch {
    users = [];
  }

  return (
    <div>
      <AdminPageHeader
        title="Team"
        subtitle="Promote content admins, manage full admins, and reset authenticator setup."
      />
      <TeamManager initialUsers={users} currentAdminId={session.userId} />
    </div>
  );
}
