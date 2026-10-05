"use client";

import { useState } from "react";
import { Check, LinkSimple, ShareNetwork } from "@phosphor-icons/react";
import { contentDetailPath } from "@/lib/catalog/paths";
import type { Content } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";

type ShareItem = Pick<Content, "id" | "slug" | "type" | "title">;

export default function ShareBar({ item }: { item: ShareItem }) {
  const path = contentDetailPath(item);
  const [copied, setCopied] = useState(false);

  const currentUrl = () => `${window.location.origin}${path}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* Clipboard access can be unavailable in private browsing. */
    }
  };

  const shareTitle = async () => {
    if (typeof navigator.share !== "function") {
      await copyLink();
      return;
    }

    try {
      await navigator.share({
        title: item.title,
        text: `Watch ${item.title} on VMC`,
        url: currentUrl(),
      });
    } catch {
      /* The user can dismiss the native share sheet. */
    }
  };

  return (
    <div className="rounded-[24px] bg-white/[0.035] p-1.5 ring-1 ring-inset ring-white/[0.08]">
      <div className="rounded-[18px] bg-black/25 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-emerald-300 ring-1 ring-inset ring-white/[0.07]">
            <ShareNetwork className="h-[18px] w-[18px]" weight="duotone" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
              Share
            </p>
            <p className="mt-0.5 text-sm font-semibold text-white">Send this title</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={copyLink}
            className={cn(
              "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold ring-1 ring-inset transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]",
              copied
                ? "bg-emerald-400/12 text-emerald-200 ring-emerald-300/25"
                : "bg-white/[0.045] text-white/65 ring-white/[0.08] hover:bg-white/[0.08] hover:text-white",
            )}
          >
            {copied ? (
              <Check className="h-4 w-4" weight="bold" />
            ) : (
              <LinkSimple className="h-4 w-4" weight="bold" />
            )}
            {copied ? "Copied" : "Copy link"}
          </button>
          <button
            type="button"
            onClick={shareTitle}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-3 text-xs font-bold text-black transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-emerald-300 active:scale-[0.98]"
          >
            <ShareNetwork className="h-4 w-4" weight="bold" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
