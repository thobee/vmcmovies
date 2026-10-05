"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Arc } from "@/components/loading-ui/arc";
import AdminPasswordField from "@/components/admin/AdminPasswordField";

export default function AdminSignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const busy = loading || navigating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    let submitted = false;

    try {
      const res = await fetch("/api/admin/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Signup failed");
        return;
      }

      submitted = true;
      setNavigating(true);
      router.push("/admin/login");
    } catch {
      setError("Network error");
    } finally {
      if (!submitted) {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="admin-signup-email" className="mb-1.5 block text-sm font-medium text-white/70">
          Email
        </label>
        <input
          id="admin-signup-email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@vmc.com"
          className="w-full rounded-xl field px-4 py-3 text-base sm:text-sm text-white placeholder:text-white/25 focus:border-[var(--amber)]/50 focus:outline-none"
        />
      </div>

      <AdminPasswordField
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        minLength={8}
        placeholder="At least 8 characters"
      />

      <button
        type="submit"
        disabled={busy}
        aria-busy={busy}
        className={cn("btn-pill btn-pill-primary w-full gap-2 py-3.5", busy && "opacity-70 cursor-wait")}
      >
        {busy && <Arc className="size-4 border-[2px]" />}
        {navigating ? "Opening sign in..." : loading ? "Creating account..." : "Create admin account"}
      </button>
    </form>
  );
}
