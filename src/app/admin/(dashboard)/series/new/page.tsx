import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SeriesForm } from "@/components/admin/ContentForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { backLinkClass } from "@/components/admin/form";

export default function AdminNewSeriesPage() {
  return (
    <div className="w-full max-w-3xl">
      <Link
        href="/admin/series"
        className={backLinkClass}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to series
      </Link>
      <AdminPageHeader
        title="Add series"
        subtitle="Search TMDB to autofill, then add season buttons with your Telegram bot links."
      />
      <SeriesForm mode="create" />
    </div>
  );
}
