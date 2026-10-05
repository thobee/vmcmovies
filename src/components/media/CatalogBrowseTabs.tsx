import Link from "next/link";
import { FilmStrip, Television } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";

export default function CatalogBrowseTabs({ active }: { active: "movies" | "series" }) {
  const tabs = [
    { id: "movies" as const, label: "Movies", href: "/movies", icon: FilmStrip },
    { id: "series" as const, label: "TV Shows", href: "/series", icon: Television },
  ];

  return (
    <div className="bezel-outer inline-flex w-fit self-start lg:self-auto">
      <div className="bezel-inner inline-flex rounded-full p-1">
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
              <Icon className="h-4 w-4" weight="bold" />
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
