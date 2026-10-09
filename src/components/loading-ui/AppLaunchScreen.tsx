"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const MINIMUM_VISIBLE_MS = 520;

/** A brief branded screen for full browser launches, not client-side navigation. */
export default function AppLaunchScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const startedAt = performance.now();
    const hide = () => {
      const elapsed = performance.now() - startedAt;
      window.setTimeout(() => setVisible(false), Math.max(0, MINIMUM_VISIBLE_MS - elapsed));
    };

    if (document.readyState === "complete") {
      hide();
      return;
    }

    window.addEventListener("load", hide, { once: true });
    return () => window.removeEventListener("load", hide);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#050606] px-5 text-white transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
      role="status"
      aria-live="polite"
      aria-label="VMC is loading"
    >
      <div className="flex flex-col items-center text-center">
        <div className="vmc-launch-mark grid size-[84px] place-items-center rounded-[26px] border border-emerald-300/20 bg-white/[0.03] p-4 sm:size-24 sm:rounded-[30px]">
          <Image src="/brand/vmc-logo.png" alt="VMC" width={128} height={61} priority className="h-auto w-full" />
        </div>
        <p
          className="vmc-loading-text mt-6 text-3xl font-black uppercase leading-none sm:text-4xl"
          style={{ fontFamily: "var(--font-comic), var(--font-display), system-ui, sans-serif" }}
        >
          Loading!!!
        </p>
        <span className="mt-4 h-px w-20 overflow-hidden bg-white/10">
          <span className="vmc-launch-line block h-full w-1/2 bg-emerald-300" />
        </span>
      </div>
    </div>
  );
}
