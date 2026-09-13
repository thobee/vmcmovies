"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Search, Sparkles } from "lucide-react";
import { inputClass } from "@/components/admin/form";
import { useAdminToast } from "@/components/admin/toast";
import type { TmdbDetails, TmdbSearchResult } from "@/lib/tmdb/client";

export default function TmdbSearch({
  type,
  onSelect,
}: {
  type: "movie" | "series";
  onSelect: (details: TmdbDetails) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbSearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<number | null>(null);
  const [error, setError] = useState("");
  const { toast } = useAdminToast();

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch(
        `/api/admin/tmdb?type=${type}&q=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "TMDB search failed");
        return;
      }

      setResults(data.results);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const applyResult = async (result: TmdbSearchResult) => {
    setApplying(result.tmdbId);
    setError("");

    try {
      const res = await fetch(
        `/api/admin/tmdb?type=${type}&tmdbId=${result.tmdbId}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not load details");
        toast({ title: "Couldn’t load TMDB details", tone: "error" });
        return;
      }

      onSelect(data.details);
      setResults(null);
      setQuery("");
      toast({ title: "Filled from TMDB", message: data.details?.title ?? result.title });
    } catch {
      setError("Network error");
      toast({ title: "Couldn’t load TMDB details", tone: "error" });
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="rounded-2xl panel p-4 sm:p-5 space-y-4 border-[var(--amber)]/20">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--amber-100)]">
        <Sparkles className="w-3.5 h-3.5" />
        Fill from TMDB
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), search())}
          placeholder={`Search ${type === "movie" ? "movie" : "series"} title…`}
          className={inputClass}
        />
        <button
          type="button"
          onClick={search}
          disabled={loading || !query.trim()}
          className="inline-flex min-h-11 w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--amber)] px-5 text-sm font-bold text-white disabled:opacity-50 hover:bg-[var(--amber-hover)]"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Search
        </button>
      </div>

      {error && <p className="text-xs text-red-300">{error}</p>}

      {results && results.length === 0 && (
        <p className="text-sm text-white/40">No results found.</p>
      )}

      {results && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {results.map((r) => (
            <button
              key={r.tmdbId}
              type="button"
              onClick={() => applyResult(r)}
              disabled={applying !== null}
              className="text-left rounded-xl overflow-hidden border border-white/[0.08] hover:border-[var(--amber)]/50 transition-colors disabled:opacity-50"
            >
              <div className="relative aspect-[2/3] bg-[var(--surface-2)]">
                {r.posterImageUrl ? (
                  <Image
                    src={r.posterImageUrl}
                    alt={r.title}
                    fill
                    sizes="150px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                    No image
                  </div>
                )}
                {applying === r.tmdbId && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-[12px] text-white font-semibold truncate">{r.title}</p>
                <p className="text-[11px] text-white/40">{r.year ?? "—"}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
