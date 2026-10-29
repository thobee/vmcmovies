import AuthForm from "@/components/auth/AuthForm";
import AuthShell from "@/components/auth/AuthShell";
import { getPlanDestination } from "@/lib/payments/plan-destination";

const ASIDE = {
  eyebrow: "VMC",
  headline: "Download movies. No ads.",
  description: "Browse free on the site. Your downloads arrive straight in Telegram — no pop-ups, no mystery pages.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string; next?: string }>;
}) {
  const { error, reset, next } = await searchParams;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to download and manage your account."
      aside={ASIDE}
    >
      {reset === "1" && (
        <p className="mb-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Password updated. Sign in with your new password.
        </p>
      )}
      <AuthForm mode="login" errorCode={error} nextDestination={getPlanDestination(next)} />
    </AuthShell>
  );
}
