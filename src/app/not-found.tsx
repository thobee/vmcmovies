import Link from "next/link";
import { Compass, FilmStrip, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import SitePage from "@/components/layout/SitePage";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <SitePage className="flex flex-col">
      <div className="flex flex-1 items-center justify-center px-4 py-24 sm:py-32">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/25">
            <FilmStrip className="h-7 w-7 text-emerald-300" weight="light" />
          </div>

          <p className="eyebrow-pill mb-3">404</p>
          <h1
            className="mb-3 text-3xl font-semibold text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
          >
            This scene doesn&apos;t exist
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-white/55">
            The page you&apos;re looking for was moved, renamed, or never existed. Let&apos;s get
            you back to the catalog.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className="btn-nested-primary justify-center">
              Back to home
              <span className="btn-nested-icon bg-black/10">
                <Compass className="h-4 w-4" weight="bold" />
              </span>
            </Link>
            <Link href="/search" className="btn-nested-ghost justify-center">
              Search titles
              <span className="btn-nested-icon bg-white/10">
                <MagnifyingGlass className="h-4 w-4" weight="bold" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </SitePage>
  );
}
