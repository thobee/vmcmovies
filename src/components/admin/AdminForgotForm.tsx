"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import AdminPasswordField from "@/components/admin/AdminPasswordField";

export default function AdminForgotForm() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOk("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", email }),
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
      setLoading(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOk("");
    if (password !== confirm) {
      setError("Passwords don’t match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", email, otp, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Couldn’t reset password");
        return;
      }
      window.location.assign("/admin/login?reset=1");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "w-full rounded-xl field px-4 py-3 text-base sm:text-sm text-white placeholder:text-white/25 focus:border-[var(--amber)]/50 focus:outline-none";

  return (
    <form onSubmit={step === "request" ? sendCode : savePassword} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {ok && !error && (
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {ok}
        </div>
      )}

      <div>
        <label htmlFor="reset-email" className="mb-1.5 block text-sm font-medium text-white/70">
          Admin email
        </label>
        <input
          id="reset-email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClass}
          disabled={step === "reset"}
        />
      </div>

      {step === "reset" && (
        <>
          <div>
            <label htmlFor="reset-otp" className="mb-1.5 block text-sm font-medium text-white/70">
              6-digit code
            </label>
            <input
              id="reset-otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className={cn(fieldClass, "tracking-[0.35em] font-semibold")}
            />
          </div>
          <AdminPasswordField
            value={password}
            onChange={setPassword}
            label="New password"
            autoComplete="new-password"
            minLength={8}
            placeholder="At least 8 characters"
          />
          <AdminPasswordField
            value={confirm}
            onChange={setConfirm}
            label="Confirm password"
            autoComplete="new-password"
            minLength={8}
            placeholder="Repeat new password"
          />
        </>
      )}

      <button
        type="submit"
        disabled={loading}
        className={cn("btn-pill btn-pill-primary w-full py-3.5", loading && "opacity-60 cursor-not-allowed")}
      >
        {loading
          ? step === "request"
            ? "Sending…"
            : "Saving…"
          : step === "request"
            ? "Send code"
            : "Update password"}
      </button>

      {step === "reset" && (
        <button
          type="button"
          onClick={() => {
            setStep("request");
            setOtp("");
            setPassword("");
            setConfirm("");
            setOk("");
            setError("");
          }}
          className="w-full text-center text-sm text-white/45 hover:text-white"
        >
          Use a different email
        </button>
      )}

      <p className="text-center text-sm text-white/40">
        Remembered it?{" "}
        <Link href="/admin/login" className="font-semibold text-[var(--amber)] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
