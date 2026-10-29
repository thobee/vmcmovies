import AuthForm from "@/components/auth/AuthForm";
import AuthShell from "@/components/auth/AuthShell";
import { getBillingConfig } from "@/lib/payments/billing/db";
import { isWelcomeTrialWindowActive } from "@/lib/payments/billing/resolve";
import { getPlanDestination } from "@/lib/payments/plan-destination";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const destination = getPlanDestination(next);
  const billing = await getBillingConfig();
  const trialActive = isWelcomeTrialWindowActive(billing);
  const trialDays = billing.welcomeTrial.durationDays;

  return (
    <AuthShell
      title="Create account"
      subtitle={
        trialActive
          ? `Free to join. New members get ${trialDays} days of Premium, no card needed.`
          : "Free to join. Premium unlocks every download."
      }
      backHref={destination ? `/login?next=${encodeURIComponent(destination)}` : "/login"}
      aside={{
        eyebrow: "VMC",
        headline: "Movies without the noise.",
        description: "Browse free, then get your movies and series delivered straight to Telegram.",
      }}
    >
      <AuthForm mode="signup" nextDestination={destination} />
    </AuthShell>
  );
}
