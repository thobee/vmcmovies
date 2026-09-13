import Link from "next/link";
import { Plus } from "lucide-react";
import ContentTable from "@/components/admin/ContentTable";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { dbGetSeriesList } from "@/lib/catalog/db";
import type { Content } from "@/lib/catalog/types";

export default async function AdminSeriesPage() {
  let items: Content[] = [];
  try {
    items = await dbGetSeriesList();
  } catch {
    items = [];
  }

  return (
    <div>
      <AdminPageHeader
        title="Series"
        badge={`${items.length} titles`}
        subtitle="TV shows with season buttons — episodes are served by your Telegram bot."
        action={
          <Link
            href="/admin/series/new"
            className="inline-flex w-full sm:w-auto min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--amber)] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[var(--amber)]/20 hover:bg-[var(--amber-hover)]"
          >
            <Plus className="w-4 h-4" />
            Add series
          </Link>
        }
      />

      <ContentTable
        items={items}
        type="series"
        featuredId={items.find((i) => i.featured)?.id}
      />
    </div>
  );
}
