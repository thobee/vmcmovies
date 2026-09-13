"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AtSign } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import AuthField from "@/components/auth/AuthField";
import GoogleButton from "@/components/auth/GoogleButton";
import PasswordField from "@/components/auth/PasswordField";
import { cn } from "@/lib/cn";
import HoneypotField from "@/components/security/HoneypotField";

const GOOGLE_ERRORS: Record<string, string> = {
  google_cancelled: "Google sign-in was cancelled.",
  google_state: "Sign-in expired. Please try again.",
  google_failed: "Google sign-in failed. Try email instead.",
};

interface AuthFormProps {
  mode: "login" | "signup";
  errorCode?: string;
}

export default function AuthForm({ mode, errorCode }: AuthFormProps) {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState(errorCode ? (GOOGLE_ERRORS[errorCode] ?? "") : "");
  const [pending, setPending] = useState(false);

  const isSignup = mode === "signup";
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";
  const googleEnabled =
    Boolean(googleClientId) &&
    !googleClientId.includes("your-client-id") &&
    googleClientId.endsWith(".apps.googleusercontent.com");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (isSignup && password !== confirm) {
      setError("Passwords don’t match");
      return;
    }

    const website = String(new FormData(e.currentTarget).get("website") ?? "");
    setPending(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isSignup
            ? { email, password, telegramUsername, website }
            : { email, password, remember, website },
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setUser(data.user);
      router.push("/account");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative space-y-5">
      <HoneypotField />
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <AuthField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        icon={<AtSign className="h-[18px] w-[18px]" />}
      />

      {isSignup && (
        <AuthField
          id="telegram"
          label="Telegram username"
          type="text"
          autoComplete="username"
          required
          value={telegramUsername}
          onChange={(e) => setTelegramUsername(e.target.value)}
          placeholder="@yourusername"
          hint="Needed for premium Telegram downloads."
        />
      )}

      <PasswordField
        id="password"
        label="Password"
        value={password}
        onChange={setPassword}
        autoComplete={isSignup ? "new-password" : "current-password"}
        minLength={isSignup ? 8 : 1}
        placeholder={isSignup ? "At least 8 characters" : "Enter your password"}
      />

      {isSignup && (
        <PasswordField
          id="confirm"
          label="Confirm password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          minLength={8}
          placeholder="Repeat your password"
        />
      )}

      {!isSignup && (
        <div className="flex items-center justify-between gap-3 pt-0.5 text-sm">
          <label className="flex cursor-pointer items-center gap-2.5 text-white/50">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="auth-checkbox"
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="font-medium text-white/45 transition hover:text-emerald-300"
          >
            Forgot password?
          </Link>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className={cn("auth-btn w-full py-3.5", pending && "cursor-not-allowed opacity-60")}
      >
        {pending ? "Please wait…" : isSignup ? "Create account" : "Log in"}
      </button>

      {googleEnabled && (
        <>
          <div className="flex items-center gap-4 py-1">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/35">
              Or
            </span>
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <GoogleButton mode={mode} disabled={pending} />
        </>
      )}

      <p className="pt-3 text-center text-sm text-white/40">
        {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-semibold text-emerald-300 hover:underline"
        >
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
