"use client";

import { cn } from "@/lib/cn";

interface Tab {
  id: string;
  label: string;
}

interface CategoryTabsProps {
  tabs: Tab[];
  selected: string;
  onSelect: (id: string) => void;
}

export default function CategoryTabs({
  tabs,
  selected,
  onSelect,
}: CategoryTabsProps) {
  return (
    <div className="flex gap-7 border-b border-white/8 overflow-x-auto hide-scroll">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelect(tab.id)}
          className={cn(
            "relative pb-3.5 text-sm font-semibold whitespace-nowrap transition-colors duration-200",
            selected === tab.id ? "text-white" : "text-white/45 hover:text-white"
          )}
        >
          {tab.label}
          {selected === tab.id && (
            <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full bg-[var(--amber)]" />
          )}
        </button>
      ))}
    </div>
  );
}
