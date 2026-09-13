import Link from "next/link";
import { Plus } from "lucide-react";
import ContentTable from "@/components/admin/ContentTable";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { dbGetMovies } from "@/lib/catalog/db";
import type { Content } from "@/lib/catalog/types";

export default async function AdminMoviesPage() {
  let items: Content[] = [];
  try {
    items = await dbGetMovies();
  } catch {
    items = [];
  }

  return (
    <div>
      <AdminPageHeader
        title="Movies"
        badge={`${items.length} titles`}
        subtitle="Your full movie catalog — star one as the homepage fallback."
        action={
          <Link
            href="/admin/movies/new"
            className="inline-flex w-full sm:w-auto min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--amber)] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[var(--amber)]/20 hover:bg-[var(--amber-hover)]"
          >
            <Plus className="w-4 h-4" />
            Add movie
          </Link>
        }
      />

      <ContentTable
        items={items}
        type="movie"
        featuredId={items.find((i) => i.featured)?.id}
      />
    </div>
  );
}
