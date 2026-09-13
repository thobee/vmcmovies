import AdminPageHeader from "@/components/admin/AdminPageHeader";
import BillingEditor from "@/components/admin/BillingEditor";

export default function AdminBillingPage() {
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
