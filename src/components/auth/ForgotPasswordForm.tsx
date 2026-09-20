"use client";

import Link from "next/link";
import { useState } from "react";
import { At } from "@phosphor-icons/react";
import AuthField from "@/components/auth/AuthField";
import PasswordField from "@/components/auth/PasswordField";
import { cn } from "@/lib/cn";
import HoneypotField from "@/components/security/HoneypotField";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  passwordSchema,
} from "@/lib/validation/password";

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [pending, setPending] = useState(false);

  const sendCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setOk("");
    setPending(true);
    const website = String(new FormData(e.currentTarget).get("website") ?? "");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", email, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Couldn’t send code");
        return;
      }
      setOk(data.message ?? "Check your inbox for a code.");
      setStep("reset");
    } catch {
      setError("Network error");
    } finally {
      setPending(false);
    }
  };

  const savePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setOk("");
    const pw = passwordSchema.safeParse(password);
    if (!pw.success) {
      setError(pw.error.issues[0]?.message ?? "Invalid password");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don’t match");
      return;
    }
    setPending(true);
    const website = String(new FormData(e.currentTarget).get("website") ?? "");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", email, otp, password, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Couldn’t reset password");
        return;
      }
      window.location.assign("/login?reset=1");
    } catch {
      setError("Network error");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={step === "request" ? sendCode : savePassword} className="relative space-y-5">
      <HoneypotField />
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {ok && step === "request" && (
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {ok}
        </div>
      )}

      {step === "request" ? (
        <>
          <p className="text-sm leading-relaxed text-white/45">
            Use the same email you signed up with. Check spam/promotions. Codes expire in 10
            minutes. Google sign-in accounts can set a password here too.
          </p>
          <AuthField
            id="forgot-email"
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            icon={<At className="h-[18px] w-[18px]" weight="light" />}
          />
          <button
            type="submit"
            disabled={pending}
            className={cn("auth-btn w-full py-3.5", pending && "cursor-not-allowed opacity-60")}
          >
            {pending ? "Sending…" : "Send code"}
          </button>
        </>
      ) : (
        <>
          <AuthField
            id="forgot-otp"
            label="6-digit code"
            inputMode="numeric"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="text-center tracking-[0.35em]"
          />
          <PasswordField
            label="New password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            maxLength={PASSWORD_MAX_LENGTH}
            showPolicyHint
            placeholder="8–12 characters"
          />
          <PasswordField
            label="Confirm password"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            maxLength={PASSWORD_MAX_LENGTH}
            showPolicyHint
            placeholder="Repeat password"
          />
          <button
            type="submit"
            disabled={pending}
            className={cn("auth-btn w-full py-3.5", pending && "cursor-not-allowed opacity-60")}
          >
            {pending ? "Saving…" : "Update password"}
          </button>
        </>
      )}

      <p className="text-center text-sm text-white/40">
        <Link href="/login" className="font-semibold text-emerald-300 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
