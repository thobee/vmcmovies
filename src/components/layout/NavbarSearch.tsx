"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { CircleNotch, FilmStrip, MagnifyingGlass, Television, X } from "@phosphor-icons/react";
import { contentDetailPath } from "@/lib/catalog/paths";
import { useCatalogSearch } from "@/hooks/useCatalogSearch";
import { cn } from "@/lib/cn";

export default function NavbarSearch({
  variant = "desktop",
  onNavigate,
  className,
}: {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const resultsId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const { results, loading } = useCatalogSearch(query);

  const trimmed = query.trim();
  const showPanel = open && trimmed.length >= 2;

  useEffect(() => {
    if (!showPanel) return;
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, [showPanel]);

  const goTo = (href: string) => {
    setOpen(false);
    setQuery("");
    onNavigate?.();
    router.push(href);
  };

  const submitAll = () => {
    if (!trimmed) return;
    goTo(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!showPanel || results.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        submitAll();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.min(results.length, 6) - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[active];
      if (item) goTo(contentDetailPath(item));
      else submitAll();
    }
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitAll();
        }}
        className={cn(
          "flex items-center gap-2.5 border border-white/[0.08] bg-black/25 transition-colors duration-200 focus-within:border-emerald-400/50 focus-within:bg-black/40",
          variant === "desktop"
            ? "h-11 w-full rounded-full px-4"
            : "h-11 rounded-2xl px-4",
        )}
      >
        <MagnifyingGlass className="h-4 w-4 shrink-0 text-white/35" weight="bold" />
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search movies, shows..."
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-white shadow-none outline-none ring-0 placeholder:text-white/35 focus:outline-none focus:ring-0"
          autoComplete="off"
          role="combobox"
          aria-label="Search movies and TV shows"
          aria-expanded={showPanel}
          aria-controls={showPanel ? resultsId : undefined}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="rounded-full p-0.5 text-white/40 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-3.5 w-3.5" weight="bold" />
          </button>
        )}
      </form>

      {showPanel && (
        <div
          id={resultsId}
          role="listbox"
          className={cn(
            "absolute z-[60] overflow-hidden rounded-2xl border border-white/10 bg-[#101214] shadow-[0_20px_60px_rgba(0,0,0,0.55)]",
            variant === "desktop" ? "left-0 top-[calc(100%+10px)] w-[min(100vw-2rem,22rem)] sm:w-80" : "inset-x-0 top-[calc(100%+8px)]",
          )}
        >
          {loading && (
            <div className="flex items-center gap-2.5 px-4 py-3.5 text-sm text-white/50">
              <CircleNotch className="h-4 w-4 animate-spin text-emerald-400" weight="bold" />
              Searching…
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="px-4 py-5 text-center">
              <p className="text-sm font-semibold text-white/80">No matches</p>
              <p className="mt-1 text-xs text-white/45">Try another title or genre</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <ul className="max-h-[min(60vh,360px)] overflow-y-auto py-1.5">
              {results.slice(0, 6).map((item, i) => (
                <li key={item.id} role="option" aria-selected={active === i}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => goTo(contentDetailPath(item))}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-left transition",
                      active === i ? "bg-emerald-500/10" : "hover:bg-white/[0.04]",
                    )}
                  >
                    <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-md bg-white/5 ring-1 ring-white/10">
                      <Image
                        src={item.posterImageUrl}
                        alt=""
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-0.5 flex items-center gap-2 text-[11px] text-white/45">
                        <span className="inline-flex items-center gap-1">
                          {item.type === "series" ? (
                            <Television className="h-3 w-3" weight="light" />
                          ) : (
                            <FilmStrip className="h-3 w-3" weight="light" />
                          )}
                          {item.type === "series" ? "Series" : "Movie"}
                        </span>
                        {item.year && <span>{item.year}</span>}
                        {item.genres[0] && <span className="truncate">{item.genres[0]}</span>}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {trimmed && (
            <button
              type="button"
              onClick={submitAll}
              className="w-full border-t border-white/10 px-4 py-3 text-left text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/10"
            >
              View all results for &ldquo;{trimmed}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
