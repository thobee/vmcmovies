"use client";

import { Plus, Trash2 } from "lucide-react";
import type { DownloadFile, Episode, Season } from "@/lib/catalog/types";
import { FormField, inputClass } from "@/components/admin/form";

const actionClass = "inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-emerald-300 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-emerald-300";

export function AdditionalFilesFields({ files, onChange }: {
  files: DownloadFile[];
  onChange: (files: DownloadFile[]) => void;
}) {
  const update = (index: number, patch: Partial<DownloadFile>) =>
    onChange(files.map((file, i) => i === index ? { ...file, ...patch } : file));
  return (
    <div className="space-y-4">
      {files.map((file, index) => (
        <fieldset key={index} className="space-y-3 border-b border-white/10 pb-4">
          <legend className="mb-3 text-sm font-semibold text-white">File {index + 1}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="File label" required>
              <input className={inputClass} value={file.label} required maxLength={120} placeholder="Movie + subtitles ZIP" onChange={e => update(index, { label: e.target.value })} />
            </FormField>
            <FormField label="Telegram link" required>
              <input className={inputClass} type="url" value={file.downloadUrl} required placeholder="https://t.me/yourbot?start=..." onChange={e => update(index, { downloadUrl: e.target.value })} />
            </FormField>
            <FormField label="Quality (optional)">
              <input className={inputClass} value={file.quality ?? ""} maxLength={30} placeholder="1080p" onChange={e => update(index, { quality: e.target.value })} />
            </FormField>
            <FormField label="File size (optional)">
              <input className={inputClass} value={file.fileSize ?? ""} maxLength={30} placeholder="1.2 GB" onChange={e => update(index, { fileSize: e.target.value })} />
            </FormField>
          </div>
          <button type="button" className={actionClass} onClick={() => onChange(files.filter((_, i) => i !== index))}><Trash2 size={16} /> Remove file {index + 1}</button>
        </fieldset>
      ))}
      <button type="button" className={actionClass} disabled={files.length >= 30} onClick={() => onChange([...files, { label: "", downloadUrl: "" }])}><Plus size={16} /> Add file link</button>
    </div>
  );
}

export function SeasonFilesFields({ season, onChange }: {
  season: Season;
  onChange: (patch: Partial<Season>) => void;
}) {
  const episodes = season.episodes ?? [];
  const updateEpisodes = (next: Episode[]) => {
    onChange({
      episodes: next,
      status: next.some(ep => ep.isFinal) ? "completed" : "ongoing",
    });
  };
  return (
    <div className="space-y-4 border-t border-white/10 pt-4">
      <FormField label="Season status" hint="Completed means all episodes are available on VMC. This does not change the overall series status.">
        <select className={inputClass} value={season.status ?? ""} onChange={e => {
          const status = e.target.value as "ongoing" | "completed";
          onChange({ status, episodes: status === "ongoing" ? episodes.map(ep => ({ ...ep, isFinal: false })) : episodes });
        }}>
          <option value="" disabled>Choose season status</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
      </FormField>
      <FormField label="Full season ZIP link (optional)">
        <input className={inputClass} type="url" value={season.zipUrl ?? ""} placeholder="https://t.me/yourbot?start=..." onChange={e => onChange({ zipUrl: e.target.value })} />
      </FormField>
      {episodes.map((episode, index) => (
        <fieldset key={index} className="space-y-3 border-b border-white/10 pb-4">
          <legend className="mb-3 text-sm font-semibold text-white">Episode {episode.episodeNumber || index + 1}</legend>
          <div className="grid gap-3 sm:grid-cols-[6rem_1fr]">
            <FormField label="Number" required>
              <input type="number" min={1} step={1} required className={inputClass} value={episode.episodeNumber} onChange={e => onChange({ episodes: episodes.map((ep, i) => i === index ? { ...ep, episodeNumber: Number(e.target.value) } : ep) })} />
            </FormField>
            <FormField label="Title (optional)">
              <input className={inputClass} value={episode.title ?? ""} maxLength={200} onChange={e => onChange({ episodes: episodes.map((ep, i) => i === index ? { ...ep, title: e.target.value } : ep) })} />
            </FormField>
          </div>
          <FormField label="Episode Telegram link" required>
            <input type="url" required className={inputClass} value={episode.downloadUrl} placeholder="https://t.me/yourbot?start=..." onChange={e => onChange({ episodes: episodes.map((ep, i) => i === index ? { ...ep, downloadUrl: e.target.value } : ep) })} />
          </FormField>
          <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-sm text-white/80">
            <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-emerald-400" checked={episode.isFinal ?? false}
              onChange={e => updateEpisodes(episodes.map((ep, i) => ({ ...ep, isFinal: i === index ? e.target.checked : false })))} />
            <span>This is the final episode of this season<span className="mt-1 block text-xs leading-5 text-white/50">Saving marks this season Completed. Confirm all episodes are available.</span></span>
          </label>
          <button type="button" className={actionClass} onClick={() => updateEpisodes(episodes.filter((_, i) => i !== index).map(ep => ({ ...ep, isFinal: false })))}><Trash2 size={16} /> Remove episode {episode.episodeNumber}</button>
        </fieldset>
      ))}
      <button type="button" className={actionClass} disabled={episodes.length >= 500} onClick={() => updateEpisodes([...episodes.map(ep => ({ ...ep, isFinal: false })), { episodeNumber: Math.max(0, ...episodes.map(ep => ep.episodeNumber)) + 1, downloadUrl: "" }])}><Plus size={16} /> Add episode</button>
    </div>
  );
}
