import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WHY_VMC_ITEMS } from "@/lib/marketing/why-vmc";

export default function WhyVmcSection() {
  return (
    <section className="border-t border-neutral-200/80 bg-[#f8f9fb] px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
      <div className="mx-auto max-w-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Why VMC?
        </p>
        <h2
          className="mt-2 text-[1.5rem] font-bold leading-tight text-neutral-900 sm:text-[1.85rem]"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
        >
          No trailers. Just the movie.
        </h2>
        <p className="mt-2.5 text-sm leading-6 text-neutral-600 sm:text-[15px] sm:leading-7">
          A real catalogue, verified downloads, and delivery straight to Telegram — without ads,
          traps, or sketchy sites.
        </p>

        <ol className="mt-7 divide-y divide-neutral-200">
          {WHY_VMC_ITEMS.map((item, i) => (
            <li key={item.title} className="flex gap-4 py-3.5 first:pt-0">
              <span
                className="w-6 shrink-0 pt-0.5 text-xs font-medium tabular-nums text-neutral-400"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-neutral-900">{item.title}</h3>
                <p className="mt-1 text-[13px] leading-6 text-neutral-600">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-col gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-500">
            Browse free. Pay only when you want downloads.
          </p>
          <Link
            href="/get-access"
            className="auth-btn inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm"
          >
            Get premium access
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
