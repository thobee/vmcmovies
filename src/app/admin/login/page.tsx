import AdminLoginForm from "@/components/admin/AdminLoginForm";
import AdminAuthLayout from "@/components/admin/AdminAuthLayout";
import Link from "next/link";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const { reset } = await searchParams;

  return (
    <AdminAuthLayout
      eyebrow="Welcome back"
      title="Sign in"
      subtitle="Email and password first, then a 6-digit code from your authenticator app."
      footer={
        <Link href="/login" className="text-white/50 hover:text-white/80 hover:underline">
          Site login
        </Link>
      }
    >
      {reset === "1" && (
        <p className="mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Password updated. Sign in with your new password.
        </p>
      )}
      <AdminLoginForm />
    </AdminAuthLayout>
  );
}
