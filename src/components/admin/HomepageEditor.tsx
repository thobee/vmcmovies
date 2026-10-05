"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Film,
  ImageIcon,
  Layers,
  Plus,
  Sparkles,
  Star,
  Trash2,
  Tv,
} from "lucide-react";
import ImageField from "@/components/admin/ImageField";
import {
  FormActions,
  FormError,
  FormField,
  FormSection,
  inputClass,
  primaryBtnClass,
} from "@/components/admin/form";
import { useAdminToast } from "@/components/admin/toast";
import {
  DEFAULT_SECTION_TITLES,
  MAX_HERO_SLIDES,
  type HomepageSectionTitles,
  type HomepageSettings,
  type HeroSlide,
} from "@/lib/site/types";
import { cn } from "@/lib/cn";
import type { Content } from "@/lib/catalog/types";
import { contentDetailPath } from "@/lib/catalog/paths";

const SECTION_META: {
  key: keyof HomepageSectionTitles;
  label: string;
  hint: string;
  icon: typeof Film;
  defaultTitle: string;
}[] = [
  {
    key: "trendingMovies",
    label: "Row 1 — Movies",
    hint: "Shows your latest movies from the catalog.",
    icon: Film,
    defaultTitle: DEFAULT_SECTION_TITLES.trendingMovies,
  },
  {
    key: "popularSeries",
    label: "Row 2 — TV shows",
    hint: "Shows your latest series from the catalog.",
    icon: Tv,
    defaultTitle: DEFAULT_SECTION_TITLES.popularSeries,
  },
  {
    key: "recentlyAdded",
    label: "Row 3 — Recently added",
    hint: "Newest movies and series mixed together.",
    icon: Sparkles,
    defaultTitle: DEFAULT_SECTION_TITLES.recentlyAdded,
  },
  {
    key: "awardWinning",
    label: "Row 4 — Top rated",
    hint: "Highest-rated movies (hidden if fewer than 4 have ratings).",
    icon: Star,
    defaultTitle: DEFAULT_SECTION_TITLES.awardWinning,
  },
];

function newSlide(): HeroSlide {
  return {
    id: `slide-${Date.now()}`,
    eyebrow: "New on VMC",
    title: "",
    description: "",
    imageUrl: "",
    ctaLabel: "View details",
    ctaHref: "",
    enabled: true,
  };
}

export default function HomepageEditor({
  initial,
  catalog,
}: {
  initial: HomepageSettings;
  catalog: Content[];
}) {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [slides, setSlides] = useState<HeroSlide[]>(initial.slides);
  const [sectionTitles, setSectionTitles] = useState({
    ...DEFAULT_SECTION_TITLES,
    ...initial.sectionTitles,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState("");
  const [openSlide, setOpenSlide] = useState<number | null>(
    initial.slides.length > 0 ? 0 : null,
  );

  const addSlide = () => {
    if (slides.length >= MAX_HERO_SLIDES) return;
    setSlides([...slides, newSlide()]);
    setOpenSlide(slides.length);
  };

  const addCatalogSlide = () => {
    if (!selectedContentId || slides.length >= MAX_HERO_SLIDES) return;
    const item = catalog.find((entry) => entry.id === selectedContentId);
    if (!item) return;

    const slide: HeroSlide = {
      id: `slide-${item.id}-${Date.now()}`,
      eyebrow: item.type === "series" ? "Featured series" : "Featured movie",
      title: item.title,
      description: item.description,
      imageUrl: item.backdropImageUrl || item.posterImageUrl,
      ctaLabel: "View details",
      ctaHref: contentDetailPath(item),
      enabled: true,
    };

    setSlides((items) => [...items, slide]);
    setOpenSlide(slides.length);
    setSelectedContentId("");
  };

  const selectedPaths = new Set(slides.map((slide) => slide.ctaHref).filter(Boolean));
  const availableCatalog = catalog.filter(
    (item) => !selectedPaths.has(contentDetailPath(item)),
  );

  const updateSlide = (index: number, patch: Partial<HeroSlide>) => {
    setSlides((items) => items.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const removeSlide = (index: number) => {
    setSlides((items) => items.filter((_, i) => i !== index));
    setOpenSlide((cur) => {
      if (cur === null) return null;
      if (cur === index) return null;
      if (cur > index) return cur - 1;
      return cur;
    });
  };

  const moveSlide = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= slides.length) return;
    setSlides((items) => {
      const copy = [...items];
      const [item] = copy.splice(index, 1);
      copy.splice(next, 0, item);
      return copy;
    });
    setOpenSlide(next);
  };

  const resetTitles = () => {
    setSectionTitles({ ...DEFAULT_SECTION_TITLES });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides, sectionTitles }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Save failed");
        toast({ title: "Homepage not saved", message: data.error, tone: "error" });
        return;
      }
      toast({
        title: "Homepage saved",
        message: `${slides.length} slide${slides.length === 1 ? "" : "s"} · section titles updated`,
      });
      router.refresh();
    } catch {
      setError("Network error");
      toast({ title: "Network error", tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      {error && <FormError>{error}</FormError>}

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5">
        <div className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--amber)]/15 text-[var(--amber)]">
            <Layers className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">How the homepage works</p>
            <ul className="mt-2 space-y-1.5 text-xs leading-5 text-white/50">
              <li>
                <span className="font-semibold text-white/70">Hero carousel</span> — choose up to five
                movies and series. Their artwork and details are filled in automatically, and you can
                still edit them before saving.
              </li>
              <li>
                <span className="font-semibold text-white/70">Section titles</span> — only rename the
                headings on the 4 content rows below the hero. The titles shown here don’t pick the
                movies — the catalog order / ratings do.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <FormSection
        title="Hero carousel"
        hint={`Choose up to ${MAX_HERO_SLIDES} movies or series. They play in this order on the homepage.`}
      >
        <div className="grid gap-3 rounded-xl border border-white/[0.07] bg-[#141414] p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-4">
          <label className="min-w-0">
            <span className="mb-2 block text-xs font-semibold text-white/65">
              Add from your catalog
            </span>
            <select
              value={selectedContentId}
              onChange={(event) => setSelectedContentId(event.target.value)}
              disabled={slides.length >= MAX_HERO_SLIDES || availableCatalog.length === 0}
              className={cn(inputClass, "w-full")}
            >
              <option value="">Select a movie or series</option>
              {availableCatalog.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.type === "series" ? "Series" : "Movie"} — {item.title}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={addCatalogSlide}
            disabled={!selectedContentId || slides.length >= MAX_HERO_SLIDES}
            className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--amber)] px-4 text-sm font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 sm:self-end"
          >
            <Plus className="h-4 w-4" />
            Add featured title
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/40">
            {slides.length} / {MAX_HERO_SLIDES} slides
            {slides.filter((s) => s.enabled).length > 0 &&
              ` · ${slides.filter((s) => s.enabled).length} enabled`}
          </p>
          <button
            type="button"
            onClick={addSlide}
            disabled={slides.length >= MAX_HERO_SLIDES}
            className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-white/60 hover:bg-white/[0.08] hover:text-white disabled:opacity-40 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add custom slide
          </button>
        </div>

        {slides.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center">
            <ImageIcon className="mx-auto mb-3 h-8 w-8 text-white/20" />
            <p className="text-sm font-medium text-white/50">No custom slides yet</p>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-white/35">
              Choose a movie or series above. If you leave this empty, the homepage uses your
              starred featured title.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {slides.map((slide, index) => {
            const open = openSlide === index;
            const linkedItem = catalog.find(
              (item) => contentDetailPath(item) === slide.ctaHref,
            );
            return (
              <div
                key={slide.id}
                className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#141414]"
              >
                <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] px-3 py-2.5 sm:px-4">
                  <button
                    type="button"
                    onClick={() => setOpenSlide(open ? null : index)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-xs font-bold text-white/50">
                      {index + 1}
                    </span>
                    <span className="min-w-0 truncate text-sm font-semibold text-white">
                      {slide.title.trim() || `Slide ${index + 1}`}
                    </span>
                    {linkedItem && (
                      <span className="shrink-0 rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] font-bold uppercase text-white/45">
                        {linkedItem.type === "series" ? "Series" : "Movie"}
                      </span>
                    )}
                    {!slide.enabled && (
                      <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/40">
                        Hidden
                      </span>
                    )}
                    {slide.enabled && slide.imageUrl && (
                      <span className="hidden shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300 sm:inline">
                        Live
                      </span>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveSlide(index, -1)}
                      disabled={index === 0}
                      className="rounded-lg p-2 text-white/35 hover:bg-white/[0.06] hover:text-white disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSlide(index, 1)}
                      disabled={index === slides.length - 1}
                      className="rounded-lg p-2 text-white/35 hover:bg-white/[0.06] hover:text-white disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <label className="ml-1 flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-white/55">
                      <input
                        type="checkbox"
                        checked={slide.enabled}
                        onChange={(e) => updateSlide(index, { enabled: e.target.checked })}
                        className="h-3.5 w-3.5 accent-[var(--amber)]"
                      />
                      Show
                    </label>
                    <button
                      type="button"
                      onClick={() => removeSlide(index)}
                      className="rounded-lg p-2 text-white/35 hover:bg-red-500/10 hover:text-red-300"
                      aria-label="Remove slide"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {open && (
                  <div className="space-y-4 p-4 sm:p-5">
                    <ImageField
                      label="Hero image"
                      required
                      value={slide.imageUrl}
                      onChange={(url) => updateSlide(index, { imageUrl: url })}
                      wide
                      hint="Wide backdrop — upload or paste a URL"
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField label="Eyebrow" hint='Small line above the title, e.g. "New this week"'>
                        <input
                          value={slide.eyebrow ?? ""}
                          onChange={(e) => updateSlide(index, { eyebrow: e.target.value })}
                          placeholder="New on VMC"
                          className={inputClass}
                        />
                      </FormField>
                      <FormField label="Title" required>
                        <input
                          value={slide.title}
                          onChange={(e) => updateSlide(index, { title: e.target.value })}
                          placeholder="Movie or series name"
                          className={inputClass}
                          required
                        />
                      </FormField>
                    </div>

                    <FormField label="Description" hint="Short plot blurb under the title.">
                      <textarea
                        value={slide.description ?? ""}
                        onChange={(e) => updateSlide(index, { description: e.target.value })}
                        rows={3}
                        placeholder="One or two sentences…"
                        className={cn(inputClass, "min-h-20 resize-y")}
                      />
                    </FormField>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField label="Button text">
                        <input
                          value={slide.ctaLabel ?? ""}
                          onChange={(e) => updateSlide(index, { ctaLabel: e.target.value })}
                          placeholder="View details"
                          className={inputClass}
                        />
                      </FormField>
                      <FormField
                        label="Button link"
                        hint="Where the button goes — e.g. /movie/slug or /get-access"
                      >
                        <input
                          value={slide.ctaHref ?? ""}
                          onChange={(e) => updateSlide(index, { ctaHref: e.target.value })}
                          placeholder="/movies"
                          className={inputClass}
                        />
                      </FormField>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </FormSection>

      <FormSection
        title="Section titles"
        hint="Rename the 4 content rows below the hero. This only changes the heading text — not which titles appear."
      >
        <div className="mb-1 flex justify-end">
          <button
            type="button"
            onClick={resetTitles}
            className="text-xs font-semibold text-white/40 transition hover:text-[var(--amber)]"
          >
            Reset to defaults
          </button>
        </div>

        <div className="space-y-3">
          {SECTION_META.map(({ key, label, hint, icon: Icon, defaultTitle }) => (
            <div
              key={key}
              className="rounded-xl border border-white/[0.06] bg-[#141414] p-4"
            >
              <div className="mb-3 flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--amber)]/12 text-[var(--amber)]">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="mt-0.5 text-xs leading-5 text-white/40">{hint}</p>
                </div>
              </div>
              <FormField label="Heading on site">
                <input
                  value={sectionTitles[key]}
                  onChange={(e) =>
                    setSectionTitles((titles) => ({ ...titles, [key]: e.target.value }))
                  }
                  placeholder={defaultTitle}
                  className={inputClass}
                  required
                />
              </FormField>
            </div>
          ))}
        </div>
      </FormSection>

      <FormActions>
        <button type="submit" disabled={loading} className={primaryBtnClass}>
          {loading ? "Saving…" : "Save homepage"}
        </button>
      </FormActions>
    </form>
  );
}
