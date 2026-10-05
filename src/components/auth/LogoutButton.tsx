"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Arc } from "@/components/loading-ui/arc";

export default function LogoutButton() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    if (pending) return;
    setPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      onClick={handleLogout}
      className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-wait disabled:opacity-70"
    >
      {pending && <Arc className="size-4 border-[2px]" />}
      {pending ? "Signing out..." : "Log out"}
    </button>
  );
}
