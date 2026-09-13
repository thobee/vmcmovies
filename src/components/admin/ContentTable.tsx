"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import type { Content } from "@/lib/catalog/types";
import { contentSlug, adminMovieEditPath, adminSeriesEditPath } from "@/lib/catalog/resolve";
import { cn } from "@/lib/cn";
import { useAdminToast } from "@/components/admin/toast";

export default function ContentTable({
  items,
  type,
  featuredId,
}: {
  items: Content[];
  type: "movie" | "series";
  featuredId?: string | null;
}) {
  const router = useRouter();
  const { toast, confirm } = useAdminToast();
  const base = type === "movie" ? "/admin/movies" : "/admin/series";
  const kind = type === "movie" ? "movie" : "series";

  const handleDelete = async (id: string, title: string) => {
    const ok = await confirm({
      title: `Delete this ${kind}?`,
      message: `Delete “${title}”? This cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;

    const res = await fetch(`/api/admin/content/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: `Deleted ${kind}`, message: title });
      router.refresh();
    } else {
      toast({ title: "Delete failed", tone: "error" });
    }
  };

  const handleFeatured = async (id: string, title: string) => {
    const res = await fetch(`/api/admin/content/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "featured" }),
    });
    if (res.ok) {
      toast({ title: "Set as featured", message: title });
      router.refresh();
    } else {
      toast({ title: "Couldn’t set featured", tone: "error" });
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-[#1a1a1a] px-6 py-16 text-center">
        <p className="text-sm text-white/45 mb-4">
          No {type === "movie" ? "movies" : "series"} yet.
        </p>
        <Link
          href={`${base}/new`}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--amber)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--amber-hover)]"
        >
          <Plus className="w-4 h-4" />
          Add your first {type}
        </Link>
      </div>
    );
  }

  const Actions = ({ item, isFeatured }: { item: Content; isFeatured: boolean }) => (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => handleFeatured(item.id, item.title)}
        title={isFeatured ? "Homepage fallback featured" : "Set as featured fallback"}
        className={cn(
          "p-2 rounded-lg transition-colors hover:bg-white/[0.06]",
          isFeatured ? "text-[var(--amber)]" : "text-white/35 hover:text-[var(--amber)]"
        )}
      >
        <Star className={cn("w-4 h-4", isFeatured && "fill-current")} />
      </button>
      <Link
        href={type === "movie" ? adminMovieEditPath(item) : adminSeriesEditPath(item)}
        title="Edit"
        className="p-2 rounded-lg text-white/35 hover:text-white hover:bg-white/[0.06] transition-colors"
      >
        <Pencil className="w-4 h-4" />
      </Link>
      <button
        type="button"
        onClick={() => handleDelete(item.id, item.title)}
        title="Delete"
        className="p-2 rounded-lg text-white/35 hover:text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <>
      <div className="md:hidden space-y-3">
        {items.map((item) => {
          const isFeatured = featuredId === item.id;
          return (
            <article key={item.id} className="rounded-2xl panel p-3.5 flex gap-3">
              <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10 bg-white/[0.04]">
                {item.posterImageUrl && (
                  <Image
                    src={item.posterImageUrl}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{item.title}</p>
                    <p className="mt-0.5 text-[11px] text-white/35">
                      {item.year ?? "—"}
                      {item.genres[0] ? ` · ${item.genres[0]}` : ""}
                    </p>
                    {isFeatured && (
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[var(--amber)]/15 px-2 py-0.5 text-[9px] font-bold uppercase text-[var(--amber)]">
                        <Star className="h-2.5 w-2.5 fill-current" />
                        Featured
                      </span>
                    )}
                  </div>
                  <Actions item={item} isFeatured={isFeatured} />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden md:block overflow-x-auto rounded-2xl panel">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-left text-white/35 text-[11px] uppercase tracking-[0.14em]">
              <th className="px-5 py-3.5 font-semibold w-[44%]">Title</th>
              <th className="px-5 py-3.5 font-semibold w-[28%]">Genres</th>
              <th className="px-5 py-3.5 font-semibold w-[12%] text-center">Year</th>
              <th className="px-5 py-3.5 font-semibold w-[16%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isFeatured = featuredId === item.id;
              return (
                <tr
                  key={item.id}
                  className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.025] transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3.5">
                      <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md ring-1 ring-white/10 bg-white/[0.04]">
                        {item.posterImageUrl && (
                          <Image
                            src={item.posterImageUrl}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate flex items-center gap-2">
                          {item.title}
                          {isFeatured && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--amber)]/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--amber)]">
                              <Star className="h-2.5 w-2.5 fill-current" />
                              Featured
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-white/30 truncate">
                          /{type}/{contentSlug(item)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.genres.slice(0, 3).map((g) => (
                        <span
                          key={g}
                          className="rounded-full bg-white/[0.05] border border-white/[0.06] px-2 py-0.5 text-[10px] text-white/50"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-white/50 text-center whitespace-nowrap">
                    {item.year ?? "—"}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="flex justify-end">
                      <Actions item={item} isFeatured={isFeatured} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
