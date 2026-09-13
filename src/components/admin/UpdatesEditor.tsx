"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Film,
  Megaphone,
  Plus,
  Trash2,
  Tv,
} from "lucide-react";
import {
  CheckRow,
  FormActions,
  FormError,
  FormField,
  FormSection,
  inputClass,
  primaryBtnClass,
} from "@/components/admin/form";
import { useAdminToast } from "@/components/admin/toast";
import type { SiteUpdate, SiteUpdateKind } from "@/lib/site/updates/types";
import { UPDATE_KIND_LABELS } from "@/lib/site/updates/types";
import { timeAgo } from "@/lib/format/timeAgo";
import { cn } from "@/lib/cn";

const KINDS: SiteUpdateKind[] = ["news", "movie", "series", "general"];

const EMPTY = {
  kind: "news" as SiteUpdateKind,
  title: "",
  body: "",
  href: "",
  published: true,
};

function KindIcon({ kind }: { kind: SiteUpdateKind }) {
  const Icon = kind === "movie" ? Film : kind === "series" ? Tv : Megaphone;
  return <Icon className="h-4 w-4" strokeWidth={2.25} />;
}

export default function UpdatesEditor() {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [items, setItems] = useState<SiteUpdate[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  const load = async () => {
    setListLoading(true);
    try {
      const res = await fetch("/api/admin/updates");
      const data = await res.json();
      if (res.ok) setItems(data.items ?? []);
      else toast({ title: "Couldn’t load updates", message: data.error, tone: "error" });
    } catch {
      toast({ title: "Network error", tone: "error" });
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Post failed");
        toast({ title: "Update not posted", message: data.error, tone: "error" });
        return;
      }
      toast({ title: "Update posted", message: "Users will see it in the bell icon." });
      setForm(EMPTY);
      await load();
      router.refresh();
    } catch {
      setError("Network error");
      toast({ title: "Network error", tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (item: SiteUpdate) => {
    const res = await fetch(`/api/admin/updates/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !item.published }),
    });
    if (!res.ok) {
      toast({ title: "Couldn’t update", tone: "error" });
      return;
    }
    toast({
      title: item.published ? "Update hidden" : "Update live",
      message: item.title,
    });
    await load();
  };

  const remove = async (item: SiteUpdate) => {
    if (!window.confirm(`Delete “${item.title}”?`)) return;
    const res = await fetch(`/api/admin/updates/${item.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast({ title: "Delete failed", tone: "error" });
      return;
    }
    toast({ title: "Update deleted" });
    await load();
  };

  return (
    <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {error && <FormError>{error}</FormError>}

        <FormSection
          title="Post an update"
          hint="Shows in the site navbar bell for all visitors."
        >
          <FormField label="Type" required>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {KINDS.map((k) => {
                const on = form.kind === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, kind: k }))}
                    className={cn(
                      "flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2.5 text-[11px] font-semibold transition",
                      on
                        ? "border-[var(--amber)]/40 bg-[var(--amber)]/15 text-[var(--amber-100)]"
                        : "border-white/[0.08] bg-white/[0.03] text-white/50 hover:border-white/15 hover:text-white",
                    )}
                  >
                    <KindIcon kind={k} />
                    {UPDATE_KIND_LABELS[k]}
                  </button>
                );
              })}
            </div>
          </FormField>

          <FormField label="Title" required>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. New action movies added"
              className={inputClass}
              required
            />
          </FormField>

          <FormField label="Message" required>
            <textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="Short note users will read in the notification panel…"
              rows={4}
              className={cn(inputClass, "min-h-25 resize-y")}
              required
            />
          </FormField>

          <FormField
            label="Link"
            hint="Optional — movie page, series page, or Telegram channel URL."
          >
            <input
              value={form.href}
              onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
              placeholder="/movie/the-dark-knight or https://t.me/…"
              className={inputClass}
            />
          </FormField>

          <CheckRow
            checked={form.published}
            onChange={(published) => setForm((f) => ({ ...f, published }))}
          >
            Publish immediately — appear in the navbar bell now
          </CheckRow>

          <FormActions>
            <button type="submit" disabled={loading} className={primaryBtnClass}>
              {loading ? (
                "Posting…"
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Post update
                </span>
              )}
            </button>
          </FormActions>
        </FormSection>
      </form>

      <FormSection
        title="Recent updates"
        hint={
          listLoading
            ? "Loading…"
            : `${items.length} posted · Live ones show in the bell`
        }
      >
        {listLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl load-pulse bg-white/[0.04]" />
            ))}
          </div>
        )}

        {!listLoading && items.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-white/40">
            No updates posted yet. Use the form to send your first alert.
          </p>
        )}

        {!listLoading && items.length > 0 && (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-white/[0.06] bg-[#141414] p-4"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      item.kind === "movie" && "bg-emerald-500/15 text-emerald-400",
                      item.kind === "series" && "bg-sky-500/15 text-sky-300",
                      (item.kind === "news" || item.kind === "general") &&
                        "bg-[var(--amber)]/15 text-[var(--amber)]",
                    )}
                  >
                    <KindIcon kind={item.kind} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                          item.published
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-white/10 text-white/40",
                        )}
                      >
                        {item.published ? "Live" : "Hidden"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-white/35">
                      {UPDATE_KIND_LABELS[item.kind]} · {timeAgo(item.publishedAt)}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/55">{item.body}</p>
                    {item.href && (
                      <p className="mt-1.5 truncate text-[11px] text-[var(--amber)]/80">{item.href}</p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => togglePublished(item)}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs font-semibold text-white/60 transition hover:border-white/20 hover:text-white"
                      >
                        {item.published ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5" />
                            Publish
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(item)}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs font-semibold text-white/45 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </FormSection>
    </div>
  );
}
