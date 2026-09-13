import AdminForgotForm from "@/components/admin/AdminForgotForm";
import AdminAuthLayout from "@/components/admin/AdminAuthLayout";
import Link from "next/link";

export default function AdminForgotPage() {
  return (
    <AdminAuthLayout
      eyebrow="Account recovery"
      title="Reset password"
      subtitle="We’ll email a one-time code to your admin inbox. Enter it here to set a new password."
      footer={
        <Link href="/admin/login" className="text-white/50 hover:text-white/80 hover:underline">
          Back to sign in
        </Link>
      }
    >
      <AdminForgotForm />
    </AdminAuthLayout>
  );
}
