import Link from "next/link";
import AdminSignupForm from "@/components/admin/AdminSignupForm";
import AdminAuthLayout from "@/components/admin/AdminAuthLayout";
import { countAdmins } from "@/lib/auth/users";

export default async function AdminSignupPage() {
  let closed = false;
  try {
    closed = (await countAdmins()) > 0;
  } catch {
    // Mongo down — still show the form; POST is the real gate.
  }

  return (
    <AdminAuthLayout
      eyebrow={closed ? "Staff access" : "Get started"}
      title={closed ? "Signup closed" : "Create admin"}
      subtitle={
        closed
          ? "An admin account already exists. Sign in with that email, or ask the existing admin for access."
          : "Set an email and password for the VMC admin console. This only works once — the first account becomes the admin."
      }
      footer={
        <>
          Already have an account?{" "}
          <Link href="/admin/login" className="font-semibold text-[var(--amber)] hover:underline">
            Sign in
          </Link>
          <span className="text-white/20"> · </span>
          <Link href="/signup" className="text-white/50 hover:text-white/80 hover:underline">
            Public signup
          </Link>
        </>
      }
    >
      {closed ? (
        <Link href="/admin/login" className="btn-pill btn-pill-primary w-full py-3.5">
          Go to admin login
        </Link>
      ) : (
        <AdminSignupForm />
      )}
    </AdminAuthLayout>
  );
}
