"use client";

import { QUALITY_OPTIONS, type Quality } from "@/lib/catalog/quality";
import { cn } from "@/lib/cn";

export default function QualityPicker({
  value,
  onChange,
}: {
  value: Quality[];
  onChange: (next: Quality[]) => void;
}) {
  const toggle = (q: Quality) => {
    onChange(value.includes(q) ? value.filter((v) => v !== q) : [...value, q]);
  };

  return (
    <div>
      <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/60">Available qualities</p>
      <div className="flex flex-wrap gap-2">
        {QUALITY_OPTIONS.map((q) => {
          const on = value.includes(q);
          return (
            <button
              key={q}
              type="button"
              onClick={() => toggle(q)}
              className={cn(
                "min-h-11 min-w-[4.5rem] px-4 rounded-xl text-sm font-bold border transition-colors",
                on
                  ? "bg-[var(--amber)] border-[var(--amber)] text-black"
                  : "bg-[#141414] border-white/10 text-white/60 hover:text-white"
              )}
            >
              {q}
            </button>
          );
        })}
      </div>
    </div>
  );
}
