"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { useAuth } from "@/components/auth/AuthProvider";

/** Shown to signed-out visitors only; decided in the browser so the homepage stays cacheable. */
export default function TrialSignupLink() {
  const { user, loading } = useAuth();
  if (loading || user) return null;

  return (
    <Link
      href="/signup"
      className="group inline-flex w-fit shrink-0 items-center gap-1.5 text-xs font-bold text-emerald-300 transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-emerald-200"
    >
      Create account
      <ArrowRight className="h-3.5 w-3.5 transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5" weight="bold" />
    </Link>
  );
}
