"use client";

import Link from "next/link";
import { useState } from "react";
import { Crown, FilmSlate } from "@phosphor-icons/react";
import { useAuth } from "@/components/auth/AuthProvider";
import RequestModal from "@/components/requests/RequestModal";

const BUTTON =
  "mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 text-sm font-bold text-black transition-[background-color,scale] duration-200 hover:bg-emerald-300 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300";

/**
 * Empty-search call to action. Requests are a Premium perk (enforced by /api/requests):
 * Premium members get the form, others are told how to unlock it.
 */
export default function SearchRequestAction({ query, autoOpen = false }: { query: string; autoOpen?: boolean }) {
  const { user, loading } = useAuth();
  const eligible = user?.premiumStatus === "active";
  const [manualOpen, setManualOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  // The account loads in the browser, so the auto-open is derived once we know the user.
  const open = manualOpen || (autoOpen && eligible && !dismissed);
  const close = () => {
    setManualOpen(false);
    setDismissed(true);
  };
  const returnTo = `/search?q=${encodeURIComponent(query)}&request=1`;

  if (loading) return <div className="mt-5 h-12" aria-hidden />;

  if (eligible) {
    return (
      <>
        <button type="button" onClick={() => setManualOpen(true)} className={BUTTON}>
          <FilmSlate className="h-4 w-4" weight="bold" />
          Request this title
        </button>
        <p className="mt-2 text-xs text-white/55">Add the release year so we find the right one.</p>
        {open && <RequestModal open onClose={close} initialTitle={query} />}
      </>
    );
  }

  return (
    <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-emerald-400/[0.06] px-5 py-4 ring-1 ring-inset ring-emerald-400/20">
      <p className="flex items-center justify-center gap-2 text-sm font-semibold text-white">
        <Crown className="h-4 w-4 text-emerald-300" weight="fill" />
        Requesting titles is a Premium perk
      </p>
      <p className="mt-1 text-xs leading-5 text-white/60">
        {user
          ? "Premium members can request any movie or series and we add it to VMC."
          : "Log in with a Premium account to request this movie or series."}
      </p>
      <Link href={user ? "/get-access" : `/login?next=${encodeURIComponent(returnTo)}`} className={BUTTON}>
        {user ? "See Premium plans" : "Log in to request"}
      </Link>
    </div>
  );
}
