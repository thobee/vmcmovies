import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SeriesForm } from "@/components/admin/ContentForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { backLinkClass } from "@/components/admin/form";
import { dbGetContentBySlugOrId } from "@/lib/catalog/db";
import { adminSeriesEditPath } from "@/lib/catalog/resolve";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminEditSeriesPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await dbGetContentBySlugOrId(slug, "series");

  if (!item || item.type !== "series") notFound();

  const canonical = adminSeriesEditPath(item);
  if (canonical !== `/admin/series/${slug}/edit`) {
    redirect(canonical);
  }

  return (
    <div className="w-full max-w-3xl">
      <Link
        href="/admin/series"
        className={backLinkClass}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to series
      </Link>
      <AdminPageHeader title="Edit series" badge={item.title} />
      <SeriesForm mode="edit" initial={item} />
    </div>
  );
}
