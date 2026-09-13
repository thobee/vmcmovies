import Link from "next/link";
import { Compass, Film, Search } from "lucide-react";
import SitePage from "@/components/layout/SitePage";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <SitePage className="flex flex-col">

      <div className="flex-1 flex items-center justify-center px-4 py-32">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full icon-badge icon-badge-blue">
            <Film className="w-7 h-7 text-white" strokeWidth={2} />
          </div>

          <p className="eyebrow-pop mb-3 justify-center">404</p>
          <h1
            className="text-white text-3xl sm:text-4xl font-extrabold mb-3"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
          >
            This scene doesn&apos;t exist
          </h1>
          <p className="text-white/55 text-sm leading-relaxed mb-8">
            The page you&apos;re looking for was moved, renamed, or never existed. Let&apos;s get
            you back to the catalog.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn-pill btn-pill-primary">
              <Compass className="w-4 h-4" />
              Back to home
            </Link>
            <Link href="/search" className="btn-pill glass text-white hover:bg-[var(--surface-2)]">
              <Search className="w-4 h-4" />
              Search titles
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </SitePage>
  );
}
