"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export default function PlotText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 220;

  return (
    <div>
      <p
        className={cn(
          "max-w-2xl text-[15px] leading-7 text-white/75",
          long && !open && "line-clamp-4 lg:line-clamp-none",
        )}
      >
        {text}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 lg:hidden"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
