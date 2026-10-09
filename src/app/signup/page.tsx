import { Sparkle } from "@phosphor-icons/react/dist/ssr";
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
          ? `Create your account and unlock ${trialDays} days of Premium free.`
          : "Free to join. Premium unlocks downloads."
      }
      backHref={destination ? `/login?next=${encodeURIComponent(destination)}` : "/login"}
      aside={{
        eyebrow: "VMC",
        headline: "Movies without the noise.",
        description:
          trialActive
            ? `Join during the launch campaign and activate ${trialDays} days of Premium from your first Premium download. No card required.`
            : "Create a free account to browse the catalog. Go premium for direct Telegram downloads — latest releases, no ads, new titles added all the time.",
        highlights: [
          trialActive ? `${trialDays} days of Premium free` : "Latest movies & series",
          "Ad-free experience",
          "Direct Telegram downloads",
        ],
      }}
    >
      {trialActive && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl bg-emerald-400/[0.08] px-4 py-3.5 ring-1 ring-inset ring-emerald-300/20">
          <Sparkle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" weight="fill" />
          <div>
            <p className="text-sm font-bold text-emerald-200">
              {billing.welcomeTrial.bannerTitle}
            </p>
            <p className="mt-1 text-xs leading-5 text-white/55">
              Sign up now, then open a Premium title to activate your {trialDays}-day access.
            </p>
          </div>
        </div>
      )}
      <AuthForm mode="signup" nextDestination={destination} />
    </AuthShell>
  );
}
