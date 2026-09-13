import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MovieForm } from "@/components/admin/ContentForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { backLinkClass } from "@/components/admin/form";

export default function AdminNewMoviePage() {
  return (
    <div className="w-full max-w-3xl">
      <Link
        href="/admin/movies"
        className={backLinkClass}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to movies
      </Link>
      <AdminPageHeader
        title="Add movie"
        subtitle="Search TMDB to autofill, or enter details manually."
      />
      <MovieForm mode="create" />
    </div>
  );
}
