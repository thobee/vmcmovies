import AuthForm from "@/components/auth/AuthForm";
import AuthShell from "@/components/auth/AuthShell";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create account"
      subtitle="Free to join. Premium unlocks downloads."
      backHref="/login"
      aside={{
        eyebrow: "VMC",
        headline: "Movies without the noise.",
        description:
          "Create a free account to browse the catalog. Go premium for direct Telegram downloads — latest releases, no ads, new titles added all the time.",
        highlights: [
          "Latest movies & series",
          "Ad-free experience",
          "Direct Telegram downloads",
        ],
      }}
    >
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
