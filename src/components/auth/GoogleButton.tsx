"use client";

import { useState } from "react";
import { Arc } from "@/components/loading-ui/arc";
import { cn } from "@/lib/cn";

function isPublicGoogleConfigured(): boolean {
  const id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";
  if (!id || id.includes("your-client-id")) return false;
  return id.endsWith(".apps.googleusercontent.com");
}

export default function GoogleButton({
  mode,
  disabled,
}: {
  mode: "login" | "signup";
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const enabled = isPublicGoogleConfigured();

  const go = () => {
    if (!enabled || disabled || loading) return;
    setLoading(true);
    // OAuth should use a full document navigation so Google receives the browser redirect.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/api/auth/google?mode=${mode}`;
  };

  if (!enabled) return null;

  return (
    <button
      type="button"
      onClick={go}
      disabled={disabled || loading}
      className={cn("auth-social-btn", (disabled || loading) && "cursor-not-allowed opacity-60")}
    >
      {loading ? <Arc className="size-4 text-neutral-700" /> : <GoogleIcon />}
      {loading
        ? "Redirecting..."
        : mode === "signup"
          ? "Sign up with Google"
          : "Continue with Google"}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
