import MovieCard from "@/components/media/MovieCard";
import ViewAllLink from "@/components/ui/ViewAllLink";
import type { Content, ContentType } from "@/lib/catalog/types";

interface RecommendedGridProps {
  items: Content[];
  browseHref: string;
  type: ContentType;
}

export default function RecommendedGrid({ items, browseHref, type }: RecommendedGridProps) {
  if (!items.length) return null;

  return (
    <section className="mt-4 border-t border-white/10 pt-10 sm:mt-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
            You might also like
          </p>
          <h2
            className="text-xl font-bold text-white sm:text-2xl"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
          >
            More {type === "series" ? "series" : "movies"}
          </h2>
        </div>
        <ViewAllLink href={browseHref} />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {items.map((item, i) => (
          <MovieCard key={item.id} item={item} index={i} simple className="w-full" />
        ))}
      </div>
    </section>
  );
}
