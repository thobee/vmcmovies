"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { genresToInput, parseGenresInput } from "@/lib/admin/content";
import type { Content, Season } from "@/lib/catalog/types";
import { buildTelegramDownloadUrl } from "@/lib/catalog/telegram";
import { normalizeSeries, sortSeasons } from "@/lib/catalog/series";
import { slugify } from "@/lib/slug";
import TmdbSearch from "@/components/admin/TmdbSearch";
import ImageField from "@/components/admin/ImageField";
import QualityPicker from "@/components/admin/QualityPicker";
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

interface MovieFormProps {
  initial?: Content;
  mode: "create" | "edit";
}

export function MovieForm({ initial, mode }: MovieFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
  const [qualities, setQualities] = useState<Quality[]>(initial?.qualities ?? ["720p", "1080p"]);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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
      downloadUrl: downloadUrl || undefined,
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
      router.push("/admin/movies");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      {error && <FormError>{error}</FormError>}

      {mode === "create" && <TmdbSearch type="movie" onSelect={applyTmdb} />}

      <FormSection
        title="Details"
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
          <FormField label="URL slug" required hint="Used in /movie/…">
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

      <FormSection title="Artwork">
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
            hint="Optional — upload or paste a link"
          />
        </div>
      </FormSection>

      <FormSection title="Catalog">
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

      <FormSection title="Download">
        <FormField label="Download URL" hint="Optional — auto-generated from ID if empty">
          <input
            value={downloadUrl}
            onChange={(e) => setDownloadUrl(e.target.value)}
            placeholder={id ? buildTelegramDownloadUrl(id) : "https://t.me/bot?start=..."}
            className={inputClass}
          />
        </FormField>
        <CheckRow checked={featured} onChange={setFeatured}>
          Use as homepage hero when no custom slides are set
        </CheckRow>
        {mode === "create" && (
          <CheckRow checked={notifyUsers} onChange={setNotifyUsers}>
            Notify users in the navbar bell about this new movie
          </CheckRow>
        )}
      </FormSection>

      <FormActions>
        <button type="submit" disabled={loading} className={primaryBtnClass}>
          {loading ? "Saving…" : mode === "create" ? "Create movie" : "Save changes"}
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
  const [qualities, setQualities] = useState<Quality[]>(initial?.qualities ?? ["720p", "1080p"]);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [notifyUsers, setNotifyUsers] = useState(true);
  const [seasons, setSeasons] = useState<Season[]>(() => initialSeasons(initial));

  const addSeason = () => {
    const nextNumber =
      seasons.length > 0 ? Math.max(...seasons.map((s) => s.seasonNumber)) + 1 : 1;
    setSeasons(sortSeasons([...seasons, { seasonNumber: nextNumber, downloadUrl: "" }]));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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
      featured,
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
      router.push("/admin/series");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      {error && <FormError>{error}</FormError>}

      {mode === "create" && <TmdbSearch type="series" onSelect={applyTmdb} />}

      <FormSection
        title="Details"
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
          <FormField label="Internal ID" required>
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              disabled={mode === "edit"}
              className={inputClass}
              required
            />
          </FormField>
          <FormField label="URL slug" required>
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

      <FormSection title="Artwork">
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
            hint="Optional — upload or paste a link"
          />
        </div>
      </FormSection>

      <FormSection title="Catalog">
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

      <FormSection title="Homepage">
        <CheckRow checked={featured} onChange={setFeatured}>
          Use as homepage hero when no custom slides are set
        </CheckRow>
        {mode === "create" && (
          <CheckRow checked={notifyUsers} onChange={setNotifyUsers}>
            Notify users in the navbar bell about this new series
          </CheckRow>
        )}
      </FormSection>

      <FormSection
        title="Seasons"
        hint='One row per season. Each "Season N" button on the site opens the Telegram link you paste here.'
      >
        <button
          type="button"
          onClick={addSeason}
          className="inline-flex w-full sm:w-auto min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[var(--amber)]/35 bg-[var(--amber)]/15 px-4 text-sm font-bold text-[var(--amber-100)] hover:bg-[var(--amber)]/25"
        >
          <Plus className="w-4 h-4" />
          Add season
        </button>

        {seasons.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/40">
            No seasons yet. Add at least Season 1.
          </p>
        )}

        {seasons.map((season, index) => (
          <div
            key={`${season.seasonNumber}-${index}`}
            className="rounded-xl border border-white/[0.06] bg-[#141414] p-4 space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-white">Season {index + 1}</span>
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
                label="Telegram bot link"
                required
                hint="Full link, e.g. https://t.me/yourbot?start=..."
              >
                <input
                  type="url"
                  value={season.downloadUrl}
                  onChange={(e) => updateSeason(index, { downloadUrl: e.target.value })}
                  placeholder="https://t.me/vmcmovies_bot?start=..."
                  className={inputClass}
                  required
                />
              </FormField>
            </div>
          </div>
        ))}
      </FormSection>

      <FormActions>
        <button type="submit" disabled={loading} className={primaryBtnClass}>
          {loading ? "Saving…" : mode === "create" ? "Create series" : "Save changes"}
        </button>
      </FormActions>
    </form>
  );
}

function initialSeasons(initial?: Content): Season[] {
  if (!initial || initial.type !== "series") {
    return [{ seasonNumber: 1, downloadUrl: "" }];
  }
  const normalized = normalizeSeries(initial);
  return normalized.seasons?.length
    ? normalized.seasons
    : [{ seasonNumber: 1, downloadUrl: "" }];
}
