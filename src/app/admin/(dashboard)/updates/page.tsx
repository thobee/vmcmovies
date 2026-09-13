import UpdatesEditor from "@/components/admin/UpdatesEditor";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default function AdminUpdatesPage() {
  return (
    <div>
      <AdminPageHeader
        title="Updates"
        subtitle="Post news and new upload alerts — they appear in the navbar bell for all visitors."
      />
      <UpdatesEditor />
    </div>
  );
}
