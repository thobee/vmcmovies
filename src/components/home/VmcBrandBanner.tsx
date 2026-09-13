import Image from "next/image";
import Link from "next/link";

const W = 1983;
const H = 793;

export default function VmcBrandBanner() {
  return (
    <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <Link
        href="/get-access"
        className="group relative mx-auto block max-w-screen-2xl overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_60px_-28px_rgba(0,0,0,0.65)] transition hover:border-emerald-400/25 sm:rounded-[28px]"
        aria-label="VMC — Your Ultimate Movie Experience. Get premium access"
      >
        <Image
          src="/vmcbanner.png"
          alt="VMC — Your Ultimate Movie Experience. High quality downloads, fast access, no ads, watch on any device."
          width={W}
          height={H}
          sizes="(max-width: 1536px) 100vw, 1536px"
          className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.01]"
          priority={false}
        />
      </Link>
    </section>
  );
}
