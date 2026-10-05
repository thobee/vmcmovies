"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Arc } from "@/components/loading-ui/arc";
import AdminPasswordField from "@/components/admin/AdminPasswordField";

type Step = "password" | "enroll" | "totp" | "recovery";

const fieldClass =
  "w-full rounded-xl field px-4 py-3 text-base sm:text-sm text-white placeholder:text-white/25 focus:border-[var(--amber)]/50 focus:outline-none";

export default function AdminLoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const busy = loading || navigating;

  const openAdmin = () => {
    setNavigating(true);
    router.push("/admin");
    router.refresh();
  };

  const resetToPassword = () => {
    setStep("password");
    setCode("");
    setUseRecovery(false);
    setQrDataUrl("");
    setSecret("");
    setRecoveryCodes([]);
    setSaved(false);
    setError("");
  };

  const restartExpiredLogin = () => {
    resetToPassword();
    setError("Your authenticator session expired. Enter your email and password again.");
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    let submitted = false;
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }
      setPassword("");
      if (data.step === "enroll") {
        setQrDataUrl(data.qrDataUrl ?? "");
        setSecret(data.secret ?? "");
        setStep("enroll");
        return;
      }
      if (data.step === "totp") {
        setStep("totp");
        return;
      }
      submitted = true;
      openAdmin();
    } catch {
      setError("Network error");
    } finally {
      if (!submitted) {
        setLoading(false);
      }
    }
  };

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    let submitted = false;
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Invalid authenticator code");
        if (data.error === "Sign in again") restartExpiredLogin();
        return;
      }
      if (data.step === "recovery" && Array.isArray(data.recoveryCodes)) {
        setRecoveryCodes(data.recoveryCodes);
        setStep("recovery");
        return;
      }
      submitted = true;
      openAdmin();
    } catch {
      setError("Network error");
    } finally {
      if (!submitted) {
        setLoading(false);
      }
    }
  };

  const continueAfterRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saved) {
      setError("Tick the box after you save the codes.");
      return;
    }
    openAdmin();
  };

  return (
    <form
      onSubmit={
        step === "password"
          ? submitPassword
          : step === "recovery"
            ? continueAfterRecovery
            : submitCode
      }
      className="space-y-5"
    >
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {step === "password" && (
        <>
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-white/70">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@vmc.com"
              className={fieldClass}
            />
          </div>
          <AdminPasswordField
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            placeholder="Enter your password"
          />
          <div className="flex justify-end -mt-2">
            <Link
              href="/admin/forgot"
              className="text-xs font-medium text-white/40 hover:text-[var(--amber)] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            className={cn("btn-pill btn-pill-primary w-full gap-2 py-3.5", busy && "opacity-70 cursor-wait")}
          >
            {busy && <Arc className="size-4 border-[2px]" />}
            {navigating ? "Opening admin..." : loading ? "Checking..." : "Continue"}
          </button>
        </>
      )}

      {step === "enroll" && (
        <>
          <p className="text-sm text-white/55 leading-relaxed">
            Scan this QR with Google Authenticator, Authy, or 1Password. Then enter the 6-digit code
            it shows.
          </p>
          {qrDataUrl && (
            <Image
              src={qrDataUrl}
              alt="Authenticator QR code"
              className="mx-auto rounded-xl bg-white p-2"
              width={220}
              height={220}
              unoptimized
            />
          )}
          <div>
            <p className="mb-1.5 text-xs font-medium text-white/40">Or type this key in the app</p>
            <code className="block break-all rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-center text-sm tracking-wider text-white/80">
              {secret}
            </code>
          </div>
          <CodeField code={code} onChange={setCode} />
          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            className={cn("btn-pill btn-pill-primary w-full gap-2 py-3.5", busy && "opacity-70 cursor-wait")}
          >
            {busy && <Arc className="size-4 border-[2px]" />}
            {navigating ? "Opening admin..." : loading ? "Verifying..." : "Verify and continue"}
          </button>
          <button
            type="button"
            onClick={resetToPassword}
            className="w-full text-center text-xs font-medium text-white/40 hover:text-[var(--amber)]"
          >
            Start over with email and password
          </button>
        </>
      )}

      {step === "totp" && (
        <>
          <p className="text-sm text-white/55">
            Open your authenticator app and enter the 6-digit code for VMC.
          </p>
          {useRecovery ? (
            <div>
              <label htmlFor="admin-recovery" className="mb-1.5 block text-sm font-medium text-white/70">
                Recovery code
              </label>
              <input
                id="admin-recovery"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX"
                autoComplete="off"
                className={cn(fieldClass, "tracking-[0.2em]")}
              />
            </div>
          ) : (
            <CodeField code={code} onChange={setCode} />
          )}
          <button
            type="button"
            className="text-xs font-medium text-white/40 hover:text-[var(--amber)]"
            onClick={() => {
              setUseRecovery((v) => !v);
              setCode("");
              setError("");
            }}
          >
            {useRecovery ? "Use authenticator code" : "Lost your phone? Use a recovery code"}
          </button>
          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            className={cn("btn-pill btn-pill-primary w-full gap-2 py-3.5", busy && "opacity-70 cursor-wait")}
          >
            {busy && <Arc className="size-4 border-[2px]" />}
            {navigating ? "Opening admin..." : loading ? "Verifying..." : "Sign in"}
          </button>
          <button
            type="button"
            onClick={resetToPassword}
            className="w-full text-center text-xs font-medium text-white/40 hover:text-[var(--amber)]"
          >
            Start over with email and password
          </button>
        </>
      )}

      {step === "recovery" && (
        <>
          <p className="text-sm text-white/55 leading-relaxed">
            Save these recovery codes somewhere offline. Each one works once if you lose your
            phone. They will not be shown again.
          </p>
          <ul className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-black/30 p-3 font-mono text-sm text-white/85">
            {recoveryCodes.map((c) => (
              <li key={c} className="text-center tracking-wider">
                {c}
              </li>
            ))}
          </ul>
          <label className="flex items-start gap-2.5 text-sm text-white/60">
            <input
              type="checkbox"
              checked={saved}
              onChange={(e) => setSaved(e.target.checked)}
              className="mt-0.5"
            />
            I saved these codes
          </label>
          <button
            type="submit"
            disabled={busy || !saved}
            aria-busy={busy}
            className={cn(
              "btn-pill btn-pill-primary w-full gap-2 py-3.5",
              busy ? "opacity-70 cursor-wait" : !saved && "opacity-60 cursor-not-allowed",
            )}
          >
            {busy && <Arc className="size-4 border-[2px]" />}
            {busy ? "Opening admin..." : "Open dashboard"}
          </button>
        </>
      )}
    </form>
  );
}

function CodeField({ code, onChange }: { code: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label htmlFor="admin-totp" className="mb-1.5 block text-sm font-medium text-white/70">
        6-digit code
      </label>
      <input
        id="admin-totp"
        inputMode="numeric"
        autoComplete="one-time-code"
        required
        pattern="[0-9]{6}"
        maxLength={6}
        value={code}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="000000"
        className={cn(fieldClass, "text-center text-lg tracking-[0.4em]")}
      />
    </div>
  );
}
