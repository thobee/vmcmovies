"use client";

import Image from "next/image";
import { Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { inputClass } from "@/components/admin/form";
import { useAdminToast } from "@/components/admin/toast";

interface ImageFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  wide?: boolean;
}

/** Poster/backdrop: paste a URL or upload JPEG/PNG/WebP (max 5 MB). */
export default function ImageField({
  label,
  required,
  value,
  onChange,
  hint = "Paste a URL or upload (Cloudinary in production)",
  wide = false,
}: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useAdminToast();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File) => {
    setUploading(true);
    setError("");

    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        toast({ title: "Upload failed", message: data.error, tone: "error" });
        return;
      }

      onChange(data.url);
      toast({ title: `${label} uploaded` });
    } catch {
      setError("Upload failed");
      toast({ title: "Upload failed", tone: "error" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
        {label}
        {required && <span className="text-[var(--amber)]"> *</span>}
      </label>
      <p className="text-[12px] text-white/35 mb-2 leading-5">{hint}</p>

      <div className="flex flex-col gap-3">
        {value && (
          <div
            className={cn(
              "relative overflow-hidden rounded-xl bg-[var(--surface-2)] ring-1 ring-[var(--border)]",
              wide ? "h-28 w-full sm:h-24" : "h-36 w-24 sm:h-28 sm:w-20"
            )}
          >
            <Image
              src={value}
              alt=""
              fill
              sizes={wide ? "400px" : "96px"}
              className="object-cover"
              unoptimized={value.startsWith("/uploads/")}
            />
          </div>
        )}

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… or /uploads/…"
          className={inputClass}
          required={required}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-semibold text-white/70",
            uploading ? "opacity-60 cursor-not-allowed" : "hover:border-[var(--amber)]/40 hover:text-white"
          )}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? "Uploading…" : "Upload image"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />
      </div>

      {error && <p className="text-[12px] text-red-300 mt-2">{error}</p>}
    </div>
  );
}
