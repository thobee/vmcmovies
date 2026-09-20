"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Link, ShareNetwork } from "@phosphor-icons/react";
import { contentDetailPath } from "@/lib/catalog/paths";
import type { Content } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";

function TelegramGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function XGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.828L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

const BTN =
  "inline-flex h-10 items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3.5 text-xs font-semibold text-white/70 transition hover:border-emerald-400/35 hover:bg-emerald-500/10 hover:text-emerald-300";

export default function ShareBar({ item }: { item: Content }) {
  const path = contentDetailPath(item);
  const [url, setUrl] = useState(path);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, [path]);

  const shareText = `Watch ${item.title} on VMC`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: item.title, text: shareText, url });
    } catch {
      /* user cancelled */
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <ShareNetwork className="h-4 w-4 text-emerald-400" weight="bold" />
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/55">Share</p>
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-[#101214] px-3 py-2.5">
          <Link className="h-3.5 w-3.5 shrink-0 text-white/35" weight="bold" />
          <p className="min-w-0 flex-1 truncate text-xs text-white/55" title={url}>
            {url}
          </p>
          <button
            type="button"
            onClick={copyLink}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition",
              copied
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-white/[0.06] text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            {copied ? <Check className="h-3.5 w-3.5" weight="bold" /> : <Copy className="h-3.5 w-3.5" weight="bold" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {canNativeShare && (
          <button type="button" onClick={nativeShare} className={BTN}>
            <ShareNetwork className="h-3.5 w-3.5" weight="bold" />
            Share
          </button>
        )}
        <a
          href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className={BTN}
        >
          <WhatsAppGlyph className="h-3.5 w-3.5 text-[#25D366]" />
          WhatsApp
        </a>
        <a
          href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`}
          target="_blank"
          rel="noopener noreferrer"
          className={BTN}
        >
          <TelegramGlyph className="h-3.5 w-3.5 text-[#2AABEE]" />
          Telegram
        </a>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`}
          target="_blank"
          rel="noopener noreferrer"
          className={BTN}
        >
          <XGlyph className="h-3.5 w-3.5" />
          X
        </a>
      </div>
    </div>
  );
}
