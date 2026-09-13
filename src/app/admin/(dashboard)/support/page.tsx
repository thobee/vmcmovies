import { countOpenSupportTickets, listSupportTickets } from "@/lib/support/db";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import SupportTable from "@/components/admin/SupportTable";

export default async function AdminSupportPage() {
  let tickets: Awaited<ReturnType<typeof listSupportTickets>> = [];
  let open = 0;

  try {
    [tickets, open] = await Promise.all([listSupportTickets(100), countOpenSupportTickets()]);
  } catch {
    // Mongo unavailable
  }

  return (
    <div>
      <AdminPageHeader
        title="Support"
        badge={`${open} open`}
        subtitle="User complaints and payment issues — reply via email, then mark resolved."
      />
      <SupportTable tickets={tickets} />
    </div>
  );
}
