"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Eye, ImageIcon, Link2, Plus, Trash2 } from "lucide-react";
import { genresToInput, parseGenresInput } from "@/lib/admin/content";
import { AdditionalFilesFields, SeasonFilesFields } from "@/components/admin/DownloadFields";
import type { Content, DownloadFile, Season } from "@/lib/catalog/types";
import { buildTelegramDownloadUrl } from "@/lib/catalog/telegram";
import { normalizeSeries, sortSeasons } from "@/lib/catalog/series";
import { slugify } from "@/lib/slug";
import TmdbSearch from "@/components/admin/TmdbSearch";
import ImageField from "@/components/admin/ImageField";
import QualityPicker from "@/components/admin/QualityPicker";
import CatalogImage from "@/components/ui/CatalogImage";
import QualityBadges from "@/components/media/QualityBadges";
import { Arc } from "@/components/loading-ui/arc";
import {
  CheckRow,
  FormActions,
  FormError,
  FormField,
  FormSection,
  inputClass,
  primaryBtnClass,
} from "@/components/admin/form";
import { queueAdminToast } from "@/components/admin/toast";
import type { TmdbDetails } from "@/lib/tmdb/client";
import type { Quality } from "@/lib/catalog/quality";
import { cn } from "@/lib/cn";

interface MovieFormProps {
  initial?: Content;
  mode: "create" | "edit";
}

type ReadinessItem = {
  label: string;
  ok: boolean;
  hint?: string;
};

const TELEGRAM_RE = /^https:\/\/(t\.me|telegram\.me)\//i;

function validTelegramUrl(value: string): boolean {
  if (!value.trim()) return false;
  try {
    const url = new URL(value.trim());
    return TELEGRAM_RE.test(url.href);
  } catch {
    return false;
  }
}

function buildReadiness(input: {
  type: "movie" | "series";
  title: string;
  id: string;
  slug: string;
  description: string;
  posterImageUrl: string;
  backdropImageUrl: string;
  genres: string;
  downloadUrl?: string;
  seasons?: Season[];
}): ReadinessItem[] {
  const parsedGenres = parseGenresInput(input.genres);
  const movieLink = input.downloadUrl?.trim() || (input.id.trim() ? buildTelegramDownloadUrl(input.id.trim()) : "");
  const seasonLinks = input.seasons ?? [];

  return [
    { label: "Title added", ok: input.title.trim().length > 0 },
    { label: "Internal ID ready", ok: /^[a-zA-Z0-9_-]{2,64}$/.test(input.id.trim()) },
    { label: "Public slug ready", ok: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug.trim()) },
    { label: "Description added", ok: input.description.trim().length >= 20, hint: "Aim for at least one clear sentence." },
    { label: "Poster image added", ok: input.posterImageUrl.trim().length > 0 },
    { label: "Backdrop image added", ok: input.backdropImageUrl.trim().length > 0, hint: "Optional, but recommended for premium pages." },
    { label: "Genres added", ok: parsedGenres.length > 0 },
    input.type === "movie"
      ? {
          label: "Telegram download link ready",
          ok: validTelegramUrl(movieLink),
          hint: input.downloadUrl?.trim() ? "Use a t.me or telegram.me link." : "Auto-generated from the internal ID.",
        }
      : {
          label: "Season links ready",
          ok: seasonLinks.length > 0 && seasonLinks.every((season) => Boolean(season.downloadUrl || season.zipUrl || season.episodes?.length) && (!season.downloadUrl || validTelegramUrl(season.downloadUrl)) && (!season.zipUrl || validTelegramUrl(season.zipUrl)) && (season.episodes ?? []).every(ep => validTelegramUrl(ep.downloadUrl))),
          hint: "Each season needs a season link, ZIP, or episode links.",
        },
  ];
}

export function MovieForm({ initial, mode }: MovieFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const busy = loading || navigating;

  const [id, setId] = useState(initial?.id ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [posterImageUrl, setPosterImageUrl] = useState(initial?.posterImageUrl ?? "");
  const [backdropImageUrl, setBackdropImageUrl] = useState(initial?.backdropImageUrl ?? "");
  const [genres, setGenres] = useState(genresToInput(initial?.genres ?? []));
  const [year, setYear] = useState(initial?.year ?? "");
  const [rating, setRating] = useState(initial?.rating ?? "");
  const [runtime, setRuntime] = useState(initial?.runtime ?? "");
  const [downloadUrl, setDownloadUrl] = useState(initial?.downloadUrl ?? "");
  const [additionalFiles, setAdditionalFiles] = useState<DownloadFile[]>(initial?.additionalFiles ?? []);
  const [qualities, setQualities] = useState<Quality[]>(initial?.qualities ?? ["720p", "1080p"]);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [accessMode, setAccessMode] = useState<AccessMode>(() => initialAccessMode(initial));
  const [freeUntil, setFreeUntil] = useState(initial?.freeUntil?.slice(0, 16) ?? "");
  const [notifyUsers, setNotifyUsers] = useState(true);

  const applyTmdb = (details: TmdbDetails) => {
    if (mode === "create" && !id.trim() && details.id) setId(details.id);
    setTitle(details.title);
    if (!slugTouched) setSlug(slugify(details.title));
    setDescription(details.description);
    if (details.posterImageUrl) setPosterImageUrl(details.posterImageUrl);
    if (details.backdropImageUrl) setBackdropImageUrl(details.backdropImageUrl);
    setGenres(genresToInput(details.genres));
    if (details.year) setYear(details.year);
    if (details.rating) setRating(details.rating);
    if (details.runtime) setRuntime(details.runtime);
  };

  const readiness = buildReadiness({
    type: "movie",
    title,
    id,
    slug,
    description,
    posterImageUrl,
    backdropImageUrl,
    genres,
    downloadUrl,
  });
  const previewDownloadUrl = downloadUrl.trim() || (id.trim() ? buildTelegramDownloadUrl(id.trim()) : "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    let submitted = false;

    const payload = {
      type: "movie" as const,
      id: id.trim(),
      slug: slug.trim(),
      title,
      description,
      posterImageUrl,
      backdropImageUrl: backdropImageUrl || undefined,
      genres: parseGenresInput(genres),
      year: year || undefined,
      rating: rating || undefined,
      runtime: runtime || undefined,
      qualities,
      additionalFiles,
      downloadUrl: downloadUrl || undefined,
      accessTier: accessMode === "free" ? "free" as const : "premium" as const,
      freeUntil:
        accessMode === "temporary_free" && freeUntil
          ? new Date(freeUntil).toISOString()
          : undefined,
      featured,
      ...(mode === "create" ? { notifyUsers } : {}),
    };

    try {
      const url =
        mode === "create" ? "/api/admin/content" : `/api/admin/content/${initial!.id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Save failed");
        return;
      }

      queueAdminToast({
        title: mode === "create" ? "Movie created" : "Movie updated",
        message:
          mode === "create" && data.notified
            ? `${title.trim()} · users notified in the bell`
            : title.trim(),
      });
      submitted = true;
      setNavigating(true);
      router.push("/admin/movies");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      if (!submitted) {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      {error && <FormError>{error}</FormError>}

      <EditorGuide
        type="movie"
        mode={mode}
        readiness={readiness}
        primaryAction="Search TMDB, confirm artwork, then add the Telegram download."
      />

      {mode === "create" && <TmdbSearch type="movie" onSelect={applyTmdb} />}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4 sm:space-y-5">
          <FormSection
            title="1. Details"
            hint="Internal ID is the Telegram key — it never changes after create."
          >
            <FormField label="Title" required>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                className={inputClass}
                required
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Internal ID" required hint="TMDB / unique key">
                <input
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  disabled={mode === "edit"}
                  placeholder="tt0468569"
                  className={inputClass}
                  required
                />
              </FormField>
              <FormField label="URL slug" required hint="Used in /movie/...">
                <input
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  placeholder="the-dark-knight"
                  className={inputClass}
                  required
                />
              </FormField>
            </div>

            <FormField label="Description" required>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className={inputClass}
                required
              />
            </FormField>
          </FormSection>

          <FormSection title="2. Artwork" hint="Poster is required. Backdrop makes detail pages and hero slots look premium.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <ImageField
                label="Poster"
                required
                value={posterImageUrl}
                onChange={setPosterImageUrl}
              />
              <ImageField
                label="Backdrop"
                value={backdropImageUrl}
                onChange={setBackdropImageUrl}
                wide
                hint="Optional — upload or paste a wide image URL"
              />
            </div>
          </FormSection>

          <FormSection title="3. Catalog info">
            <FormField label="Genres" required hint="Comma-separated">
              <input
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
                placeholder="Action, Drama"
                className={inputClass}
                required
              />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Year">
                <input value={year} onChange={(e) => setYear(e.target.value)} inputMode="numeric" className={inputClass} />
              </FormField>
              <FormField label="Rating">
                <input value={rating} onChange={(e) => setRating(e.target.value)} className={inputClass} />
              </FormField>
              <FormField label="Runtime">
                <input value={runtime} onChange={(e) => setRuntime(e.target.value)} placeholder="142 min" className={inputClass} />
              </FormField>
            </div>
            <QualityPicker value={qualities} onChange={setQualities} />
          </FormSection>

          <FormSection title="Additional files" hint="Optional Telegram links for ZIP archives, subtitles, or other versions.">
            <AdditionalFilesFields files={additionalFiles} onChange={setAdditionalFiles} />
          </FormSection>
          <FormSection title="4. Download & publish">
            <FormField label="Download URL" hint="Optional — if empty, VMC generates a Telegram bot link from the internal ID.">
              <input
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder={id ? buildTelegramDownloadUrl(id) : "https://t.me/bot?start=..."}
                className={inputClass}
              />
            </FormField>
            <LinkPreview href={previewDownloadUrl} />
            <AccessFields
              mode={accessMode}
              freeUntil={freeUntil}
              onModeChange={setAccessMode}
              onFreeUntilChange={setFreeUntil}
            />
            <CheckRow checked={featured} onChange={setFeatured}>
              Use as homepage hero when no custom slides are set
            </CheckRow>
            {mode === "create" && (
              <CheckRow checked={notifyUsers} onChange={setNotifyUsers}>
                Notify users in the navbar bell about this new movie
              </CheckRow>
            )}
          </FormSection>
        </div>

        <EditorSidePanel
          type="movie"
          readiness={readiness}
          title={title}
          description={description}
          posterImageUrl={posterImageUrl}
          backdropImageUrl={backdropImageUrl}
          year={year}
          rating={rating}
          genres={parseGenresInput(genres)}
          qualities={qualities}
        />
      </div>

      <FormActions>
        <button
          type="submit"
          disabled={busy}
          aria-busy={busy}
          className={cn(primaryBtnClass, "gap-2", busy && "cursor-wait opacity-70")}
        >
          {busy && <Arc className="size-4 border-[2px]" />}
          {navigating
            ? "Opening movies..."
            : loading
              ? "Saving..."
              : mode === "create"
                ? "Create movie"
                : "Save changes"}
        </button>
      </FormActions>
    </form>
  );
}

interface SeriesFormProps {
  initial?: Content;
  mode: "create" | "edit";
}

export function SeriesForm({ initial, mode }: SeriesFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const busy = loading || navigating;

  const [id, setId] = useState(initial?.id ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [posterImageUrl, setPosterImageUrl] = useState(initial?.posterImageUrl ?? "");
  const [backdropImageUrl, setBackdropImageUrl] = useState(initial?.backdropImageUrl ?? "");
  const [genres, setGenres] = useState(genresToInput(initial?.genres ?? []));
  const [year, setYear] = useState(initial?.year ?? "");
  const [rating, setRating] = useState(initial?.rating ?? "");
  const [runtime, setRuntime] = useState(initial?.runtime ?? "");
  const [additionalFiles, setAdditionalFiles] = useState<DownloadFile[]>(initial?.additionalFiles ?? []);
  const [qualities, setQualities] = useState<Quality[]>(initial?.qualities ?? ["720p", "1080p"]);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [accessMode, setAccessMode] = useState<AccessMode>(() => initialAccessMode(initial));
  const [freeUntil, setFreeUntil] = useState(initial?.freeUntil?.slice(0, 16) ?? "");
  const [notifyUsers, setNotifyUsers] = useState(true);
  const [seriesStatus, setSeriesStatus] = useState<"ongoing" | "completed" | "">(initial?.seriesStatus ?? "");
  const [seasons, setSeasons] = useState<Season[]>(() => initialSeasons(initial));

  const addSeason = () => {
    const nextNumber =
      seasons.length > 0 ? Math.max(...seasons.map((s) => s.seasonNumber)) + 1 : 1;
    setSeasons(sortSeasons([...seasons, { seasonNumber: nextNumber, downloadUrl: "", status: "ongoing" }]));
  };

  const updateSeason = (index: number, patch: Partial<Season>) => {
    setSeasons((items) =>
      sortSeasons(items.map((season, i) => (i === index ? { ...season, ...patch } : season)))
    );
  };

  const removeSeason = (index: number) => {
    setSeasons((items) => items.filter((_, i) => i !== index));
  };

  const applyTmdb = (details: TmdbDetails) => {
    if (mode === "create" && !id.trim() && details.id) setId(details.id);
    setTitle(details.title);
    if (!slugTouched) setSlug(slugify(details.title));
    setDescription(details.description);
    if (details.posterImageUrl) setPosterImageUrl(details.posterImageUrl);
    if (details.backdropImageUrl) setBackdropImageUrl(details.backdropImageUrl);
    setGenres(genresToInput(details.genres));
    if (details.year) setYear(details.year);
    if (details.rating) setRating(details.rating);
    if (details.runtime) setRuntime(details.runtime);
  };

  const readiness = buildReadiness({
    type: "series",
    title,
    id,
    slug,
    description,
    posterImageUrl,
    backdropImageUrl,
    genres,
    seasons,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    let submitted = false;

    const payload = {
      type: "series" as const,
      id: id.trim(),
      slug: slug.trim(),
      title,
      description,
      posterImageUrl,
      backdropImageUrl: backdropImageUrl || undefined,
      genres: parseGenresInput(genres),
      year: year || undefined,
      rating: rating || undefined,
      runtime: runtime || undefined,
      qualities,
      additionalFiles,
      accessTier: accessMode === "free" ? "free" as const : "premium" as const,
      freeUntil:
        accessMode === "temporary_free" && freeUntil
          ? new Date(freeUntil).toISOString()
          : undefined,
      featured,
      seriesStatus: seriesStatus || undefined,
      seasons,
      ...(mode === "create" ? { notifyUsers } : {}),
    };

    try {
      const url =
        mode === "create" ? "/api/admin/content" : `/api/admin/content/${initial!.id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Save failed");
        return;
      }

      queueAdminToast({
        title: mode === "create" ? "Series created" : "Series updated",
        message:
          mode === "create" && data.notified
            ? `${title.trim()} · users notified in the bell`
            : title.trim(),
      });
      submitted = true;
      setNavigating(true);
      router.push("/admin/series");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      if (!submitted) {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      {error && <FormError>{error}</FormError>}

      <EditorGuide
        type="series"
        mode={mode}
        readiness={readiness}
        primaryAction="Search TMDB, confirm artwork, then add season or episode links."
      />

      {mode === "create" && <TmdbSearch type="series" onSelect={applyTmdb} />}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4 sm:space-y-5">
          <FormSection
            title="1. Details"
            hint="Internal ID is the Telegram key — it never changes after create."
          >
            <FormField label="Title" required>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                className={inputClass}
                required
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Internal ID" required hint="TMDB / unique key">
                <input
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  disabled={mode === "edit"}
                  className={inputClass}
                  required
                />
              </FormField>
              <FormField label="URL slug" required hint="Used in /series/...">
                <input
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  className={inputClass}
                  required
                />
              </FormField>
            </div>

            <FormField label="Description" required>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className={inputClass}
                required
              />
            </FormField>
          </FormSection>

          <FormSection title="2. Artwork" hint="Poster is required. Backdrop makes detail pages and hero slots look premium.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <ImageField
                label="Poster"
                required
                value={posterImageUrl}
                onChange={setPosterImageUrl}
              />
              <ImageField
                label="Backdrop"
                value={backdropImageUrl}
                onChange={setBackdropImageUrl}
                wide
                hint="Optional — upload or paste a wide image URL"
              />
            </div>
          </FormSection>

          <FormSection title="3. Catalog info">
            <FormField label="Genres" required hint="Comma-separated">
              <input value={genres} onChange={(e) => setGenres(e.target.value)} className={inputClass} required />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Year">
                <input value={year} onChange={(e) => setYear(e.target.value)} inputMode="numeric" className={inputClass} />
              </FormField>
              <FormField label="Rating">
                <input value={rating} onChange={(e) => setRating(e.target.value)} className={inputClass} />
              </FormField>
              <FormField label="Runtime">
                <input value={runtime} onChange={(e) => setRuntime(e.target.value)} className={inputClass} />
              </FormField>
            </div>
            <QualityPicker value={qualities} onChange={setQualities} />
          </FormSection>

          <FormSection
            title="4. Seasons"
            hint="Add a season link, a ZIP archive, or individual episode links as they become available."
          >
            <button
              type="button"
              onClick={addSeason}
              className="inline-flex w-full sm:w-auto min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[var(--amber)]/35 bg-[var(--amber)]/15 px-4 text-sm font-bold text-[var(--amber-100)] hover:bg-[var(--amber)]/25"
            >
              <Plus className="w-4 h-4" />
              Add season
            </button>

            <FormField label="Series status">
              <select className={inputClass} value={seriesStatus} onChange={e => setSeriesStatus(e.target.value as typeof seriesStatus)}>
                <option value="">Not specified</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option>
              </select>
            </FormField>
            {seasons.length === 0 && (
              <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/40">
                No seasons yet. Add at least Season 1.
              </p>
            )}

            {seasons.map((season, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/[0.06] bg-[#141414] p-4 space-y-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-white">Season {season.seasonNumber}</span>
                  <button
                    type="button"
                    onClick={() => removeSeason(index)}
                    className="inline-flex min-h-9 items-center gap-1.5 px-2 text-xs font-semibold text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[7.5rem_1fr] gap-4">
                  <FormField label="Number" required>
                    <input
                      type="number"
                      min={1}
                      value={season.seasonNumber}
                      onChange={(e) =>
                        updateSeason(index, { seasonNumber: Number(e.target.value) })
                      }
                      className={inputClass}
                      required
                    />
                  </FormField>
                  <FormField
                    label="Season Telegram link (optional)"
                    hint="Full link, e.g. https://t.me/yourbot?start=..."
                  >
                    <input
                      type="url"
                      value={season.downloadUrl}
                      onChange={(e) => updateSeason(index, { downloadUrl: e.target.value })}
                      placeholder="https://t.me/vmcmovies_bot?start=..."
                      className={inputClass}
                    />
                  </FormField>
                </div>
                <SeasonFilesFields season={season} onChange={patch => updateSeason(index, patch)} />
              </div>
            ))}
          </FormSection>

          <FormSection title="Additional files" hint="Optional Telegram links for ZIP archives, subtitles, or other versions.">
            <AdditionalFilesFields files={additionalFiles} onChange={setAdditionalFiles} />
          </FormSection>
          <FormSection title="5. Publish options">
            <AccessFields
              mode={accessMode}
              freeUntil={freeUntil}
              onModeChange={setAccessMode}
              onFreeUntilChange={setFreeUntil}
            />
            <CheckRow checked={featured} onChange={setFeatured}>
              Use as homepage hero when no custom slides are set
            </CheckRow>
            {mode === "create" && (
              <CheckRow checked={notifyUsers} onChange={setNotifyUsers}>
                Notify users in the navbar bell about this new series
              </CheckRow>
            )}
          </FormSection>
        </div>

        <EditorSidePanel
          type="series"
          readiness={readiness}
          title={title}
          description={description}
          posterImageUrl={posterImageUrl}
          backdropImageUrl={backdropImageUrl}
          year={year}
          rating={rating}
          genres={parseGenresInput(genres)}
          qualities={qualities}
          seasons={seasons}
        />
      </div>

      <FormActions>
        <button
          type="submit"
          disabled={busy}
          aria-busy={busy}
          className={cn(primaryBtnClass, "gap-2", busy && "cursor-wait opacity-70")}
        >
          {busy && <Arc className="size-4 border-[2px]" />}
          {navigating
            ? "Opening series..."
            : loading
              ? "Saving..."
              : mode === "create"
                ? "Create series"
                : "Save changes"}
        </button>
      </FormActions>
    </form>
  );
}

type AccessMode = "free" | "premium" | "temporary_free";

function initialAccessMode(initial?: Content): AccessMode {
  if (initial?.accessTier === "free") return "free";
  return initial?.freeUntil ? "temporary_free" : "premium";
}

function AccessFields({
  mode,
  freeUntil,
  onModeChange,
  onFreeUntilChange,
}: {
  mode: AccessMode;
  freeUntil: string;
  onModeChange: (mode: AccessMode) => void;
  onFreeUntilChange: (value: string) => void;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-black/15 p-4 space-y-4">
      <FormField
        label="Download access"
        hint="This controls the badge users see and whether Premium is required."
        required
      >
        <select
          value={mode}
          onChange={(event) => onModeChange(event.target.value as AccessMode)}
          className={inputClass}
        >
          <option value="premium">Premium</option>
          <option value="free">Free</option>
          <option value="temporary_free">Temporarily free</option>
        </select>
      </FormField>
      {mode === "temporary_free" && (
        <FormField
          label="Free access ends"
          hint="After this time, the title automatically returns to Premium."
          required
        >
          <input
            type="datetime-local"
            value={freeUntil}
            onChange={(event) => onFreeUntilChange(event.target.value)}
            className={inputClass}
            required
          />
        </FormField>
      )}
    </div>
  );
}

function initialSeasons(initial?: Content): Season[] {
  if (!initial || initial.type !== "series") {
    return [{ seasonNumber: 1, downloadUrl: "", status: "ongoing" }];
  }
  const normalized = normalizeSeries(initial);
  return normalized.seasons?.length
    ? normalized.seasons
    : [{ seasonNumber: 1, downloadUrl: "", status: "ongoing" }];
}

function EditorGuide({
  type,
  mode,
  readiness,
  primaryAction,
}: {
  type: "movie" | "series";
  mode: "create" | "edit";
  readiness: ReadinessItem[];
  primaryAction: string;
}) {
  const readyCount = readiness.filter((item) => item.ok).length;
  const label = type === "movie" ? "movie" : "series";

  return (
    <div className="rounded-2xl border border-[var(--amber)]/18 bg-[var(--amber)]/[0.06] p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--amber-100)]">
            Guided {mode === "create" ? "upload" : "editor"}
          </p>
          <h2 className="mt-1 text-lg font-bold text-white">
            {mode === "create" ? `Add a ${label}` : `Update this ${label}`}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-white/50">{primaryAction}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
            Readiness
          </p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-white">
            {readyCount}/{readiness.length}
          </p>
        </div>
      </div>
    </div>
  );
}

function EditorSidePanel({
  type,
  readiness,
  title,
  description,
  posterImageUrl,
  backdropImageUrl,
  year,
  rating,
  genres,
  qualities,
  seasons,
}: {
  type: "movie" | "series";
  readiness: ReadinessItem[];
  title: string;
  description: string;
  posterImageUrl: string;
  backdropImageUrl: string;
  year: string;
  rating: string;
  genres: string[];
  qualities: Quality[];
  seasons?: Season[];
}) {
  return (
    <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
      <ContentPreview
        type={type}
        title={title}
        description={description}
        posterImageUrl={posterImageUrl}
        backdropImageUrl={backdropImageUrl}
        year={year}
        rating={rating}
        genres={genres}
        qualities={qualities}
        seasons={seasons}
      />
      <ReadinessPanel items={readiness} />
    </aside>
  );
}

function ContentPreview({
  type,
  title,
  description,
  posterImageUrl,
  backdropImageUrl,
  year,
  rating,
  genres,
  qualities,
  seasons,
}: {
  type: "movie" | "series";
  title: string;
  description: string;
  posterImageUrl: string;
  backdropImageUrl: string;
  year: string;
  rating: string;
  genres: string[];
  qualities: Quality[];
  seasons?: Season[];
}) {
  const displayTitle = title.trim() || `Untitled ${type}`;
  const seasonCount = seasons?.filter((season) => season.downloadUrl.trim() || season.zipUrl || season.episodes?.length).length ?? 0;

  return (
    <div className="rounded-2xl panel overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <Eye className="h-4 w-4 text-[var(--amber)]" />
        <p className="text-sm font-semibold text-white">Live preview</p>
      </div>

      <div className="relative h-36 bg-black">
        {backdropImageUrl.trim() ? (
          <CatalogImage
            src={backdropImageUrl}
            fallback={posterImageUrl}
            alt=""
            fill
            sizes="22rem"
            className="object-cover opacity-70"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-white/[0.03] text-white/20">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/45 to-transparent" />
      </div>

      <div className="-mt-14 p-4">
        <div className="relative mb-4 aspect-[2/3] w-28 overflow-hidden rounded-xl border border-white/10 bg-[#101010] shadow-2xl">
          {posterImageUrl.trim() ? (
            <CatalogImage
              src={posterImageUrl}
              fallback={backdropImageUrl}
              alt={displayTitle}
              fill
              sizes="112px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-white/20">
              <ImageIcon className="h-7 w-7" />
            </div>
          )}
        </div>

        <h3 className="line-clamp-2 text-xl font-bold leading-tight text-white">{displayTitle}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/45">
          {qualities.length > 0 && <QualityBadges qualities={qualities} size="sm" hd />}
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
            {type === "series" ? "Series" : "Movie"}
          </span>
          {year && <span>{year}</span>}
          {rating && <span className="text-amber-300">★ {rating}</span>}
        </div>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/50">
          {description.trim() || "The synopsis appears here as the admin writes it."}
        </p>

        {genres.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {genres.slice(0, 4).map((genre) => (
              <span key={genre} className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-semibold text-white/45">
                {genre}
              </span>
            ))}
          </div>
        )}

        {type === "series" && (
          <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/45">
            {seasonCount} season link{seasonCount === 1 ? "" : "s"} ready
          </p>
        )}
      </div>
    </div>
  );
}

function ReadinessPanel({ items }: { items: ReadinessItem[] }) {
  const missing = items.filter((item) => !item.ok).length;

  return (
    <div className="rounded-2xl panel p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">Before saving</p>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
            missing === 0
              ? "bg-emerald-500/15 text-emerald-300"
              : "bg-amber-500/15 text-amber-200",
          )}
        >
          {missing === 0 ? "Ready" : `${missing} to check`}
        </span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
            {item.ok ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            )}
            <div className="min-w-0">
              <p className={cn("text-xs font-semibold", item.ok ? "text-white/70" : "text-white")}>
                {item.label}
              </p>
              {!item.ok && item.hint && <p className="mt-0.5 text-[11px] leading-4 text-white/35">{item.hint}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LinkPreview({ href }: { href: string }) {
  if (!href) return null;
  const ok = validTelegramUrl(href);
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs",
        ok ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100/80" : "border-amber-500/20 bg-amber-500/10 text-amber-100/80",
      )}
    >
      <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <p className="min-w-0 break-all">
        {ok ? "Download will open: " : "Check Telegram link: "}
        {href}
      </p>
    </div>
  );
}
