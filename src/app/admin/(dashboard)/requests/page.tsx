import { countOpenTitleRequests, listTitleRequests } from "@/lib/requests/db";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import RequestsTable from "@/components/admin/RequestsTable";

export default async function AdminRequestsPage() {
  let requests: Awaited<ReturnType<typeof listTitleRequests>> = [];
  let open = 0;

  try {
    [requests, open] = await Promise.all([listTitleRequests(100), countOpenTitleRequests()]);
  } catch {
    // Mongo unavailable
  }

  return (
    <div>
      <AdminPageHeader
        title="Title requests"
        badge={`${open} open`}
        subtitle="Premium members can request movies and series from the navbar — mark done when added."
      />
      <RequestsTable requests={requests} />
    </div>
  );
}
