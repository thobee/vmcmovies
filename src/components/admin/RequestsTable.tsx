"use client";

import { useRouter } from "next/navigation";
import { Film, Tv } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAdminToast } from "@/components/admin/toast";
import type { TitleRequest } from "@/lib/requests/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RequestsTable({ requests }: { requests: TitleRequest[] }) {
  const router = useRouter();
  const { toast } = useAdminToast();

  const toggleStatus = async (item: TitleRequest) => {
    const next = item.status === "open" ? "done" : "open";
    const res = await fetch("/api/admin/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: item._id, status: next }),
    });
    if (res.ok) {
      toast({
        title: next === "done" ? "Marked done" : "Reopened request",
        message: item.title,
      });
      router.refresh();
    } else {
      toast({ title: "Couldn’t update request", tone: "error" });
    }
  };

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-[#1a1a1a] px-6 py-16 text-center">
        <p className="text-sm text-white/45">No title requests yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {requests.map((item) => (
        <article
          key={item._id}
          className={cn(
            "rounded-2xl panel p-4 sm:p-5",
            item.status === "open" && "border-(--amber)/25",
          )}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    item.status === "open"
                      ? "border-amber-500/30 bg-amber-500/12 text-amber-200"
                      : "border-white/10 bg-white/4 text-white/45",
                  )}
                >
                  {item.status}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/35">
                  {item.type === "movie" ? (
                    <Film className="h-3 w-3" />
                  ) : (
                    <Tv className="h-3 w-3" />
                  )}
                  {item.type}
                </span>
                {item.year && (
                  <span className="text-[10px] text-white/35">{item.year}</span>
                )}
                <span className="text-[10px] text-white/25">{formatDate(item.createdAt)}</span>
              </div>
              <h3 className="text-base font-semibold text-white">{item.title}</h3>
              <p className="mt-1 text-sm text-white/50">
                {item.email}
                {item.telegramUsername && (
                  <span className="text-white/35"> · @{item.telegramUsername}</span>
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() => toggleStatus(item)}
              className="shrink-0 rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/4 hover:text-white"
            >
              {item.status === "open" ? "Mark done" : "Reopen"}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
