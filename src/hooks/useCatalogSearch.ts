"use client";

import { useEffect, useState } from "react";
import type { Content } from "@/lib/catalog/types";

export function useCatalogSearch(query: string, debounceMs = 280) {
  const [response, setResponse] = useState<{ query: string; results: Content[]; error: boolean } | null>(null);
  const trimmed = query.trim();

  useEffect(() => {
    const q = trimmed;
    if (q.length < 2) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/catalog/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        if (!cancelled) setResponse({ query: q, results: (data.items as Content[]) ?? [], error: false });
      } catch {
        if (!cancelled) {
          setResponse({ query: q, results: [], error: true });
        }
      }
    }, debounceMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [trimmed, debounceMs]);

  const current = trimmed.length >= 2 && response?.query === trimmed;
  return {
    results: current ? response.results : [],
    loading: trimmed.length >= 2 && !current,
    error: current ? response.error : false,
  };
}
