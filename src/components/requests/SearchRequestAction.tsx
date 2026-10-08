"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import RequestModal from "@/components/requests/RequestModal";

export default function SearchRequestAction({ query }: { query: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const eligible = user?.premiumStatus === "active";
  const style = "mt-3 inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-bold text-emerald-300 underline decoration-emerald-300/50 underline-offset-4 transition hover:bg-emerald-400/10 hover:text-emerald-200 focus-visible:outline-2 focus-visible:outline-emerald-300";
  const returnTo = `/search?q=${encodeURIComponent(query)}`;

  return (
    <>
      {eligible ? (
        <button type="button" onClick={() => setOpen(true)} className={style}>
          Request this title
        </button>
      ) : (
        <Link href={user ? "/get-access" : `/login?next=${encodeURIComponent(returnTo)}`} className={style}>
          Request this title
        </Link>
      )}
      {!eligible && (
        <p className="text-xs leading-5 text-white/55">
          {user ? "Title requests are available with Premium." : "Log in to request a title. Premium is required."}
        </p>
      )}
      {open && <RequestModal open onClose={() => setOpen(false)} initialTitle={query} />}
    </>
  );
}
