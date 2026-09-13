import Link from "next/link";
import { Film, Tv } from "lucide-react";
import { cn } from "@/lib/cn";

export default function CatalogBrowseTabs({ active }: { active: "movies" | "series" }) {
  const tabs = [
    { id: "movies" as const, label: "Movies", href: "/movies", icon: Film },
    { id: "series" as const, label: "TV Shows", href: "/series", icon: Tv },
  ];

  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1">
      {tabs.map(({ id, label, href, icon: Icon }) => {
        const on = active === id;
        return (
          <Link
            key={id}
            href={href}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition duration-200",
              on
                ? "bg-emerald-500 text-black shadow-[0_4px_20px_rgba(34,197,94,0.35)]"
                : "text-white/60 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={2.25} />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
