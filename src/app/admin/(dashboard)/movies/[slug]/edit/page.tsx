import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MovieForm } from "@/components/admin/ContentForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { backLinkClass } from "@/components/admin/form";
import { dbGetContentBySlugOrId } from "@/lib/catalog/db";
import { adminMovieEditPath } from "@/lib/catalog/resolve";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminEditMoviePage({ params }: PageProps) {
  const { slug } = await params;
  const item = await dbGetContentBySlugOrId(slug, "movie");

  if (!item || item.type !== "movie") notFound();

  const canonical = adminMovieEditPath(item);
  if (canonical !== `/admin/movies/${slug}/edit`) {
    redirect(canonical);
  }

  return (
    <div className="w-full max-w-3xl">
      <Link
        href="/admin/movies"
        className={backLinkClass}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to movies
      </Link>
      <AdminPageHeader title="Edit movie" badge={item.title} />
      <MovieForm mode="edit" initial={item} />
    </div>
  );
}
