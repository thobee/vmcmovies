"use client";

import { useEffect, useState } from "react";
import type { Content } from "@/lib/catalog/types";

export function useCatalogSearch(query: string, debounceMs = 280) {
  const [results, setResults] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/catalog/search?q=${encodeURIComponent(q)}`);
        const data = res.ok ? await res.json() : { items: [] };
        if (!cancelled) setResults((data.items as Content[]) ?? []);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, debounceMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, debounceMs]);

  return { results, loading };
}
