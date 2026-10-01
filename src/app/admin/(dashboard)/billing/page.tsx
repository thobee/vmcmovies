import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/session";
import { canAdmin } from "@/lib/admin/permissions";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import BillingEditor from "@/components/admin/BillingEditor";

export default async function AdminBillingPage() {
  const session = await getAdminSession();
  if (!session || !canAdmin(session.role, "billing")) redirect("/admin");

  return (
    <div>
      <AdminPageHeader
        title="Billing & promos"
        subtitle="Change prices, launch offer, plan promos, and welcome copy — no deploy needed."
      />
      <BillingEditor />
    </div>
  );
}
