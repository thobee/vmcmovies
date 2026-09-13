import AuthShell from "@/components/auth/AuthShell";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot password"
      subtitle="We’ll email a reset code to your inbox."
      backHref="/login"
      aside={{
        headline: "Almost there.",
        description:
          "Reset your password and get back to downloading. Use Google sign-in if that’s how you signed up.",
      }}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
