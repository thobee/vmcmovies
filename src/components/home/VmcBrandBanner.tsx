"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

export default function VmcBrandBanner() {
  return (
    <section className="px-4 py-4 sm:px-6 sm:py-6 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        className="mx-auto max-w-xl sm:max-w-2xl"
      >
        <div className="bezel-outer">
          <Link
            href="/get-access"
            className="bezel-inner group relative block overflow-hidden"
            aria-label="VMC — Your Ultimate Movie Experience. Get premium access"
          >
            <div className="relative aspect-[5/2] w-full sm:aspect-[2.5/1]">
              <Image
                src="/vmcbanner.png"
                alt="VMC — Your Ultimate Movie Experience. High quality downloads, fast access, no ads, watch on any device."
                fill
                sizes="(max-width: 640px) 100vw, 672px"
                className="object-cover object-center transition duration-500 group-hover:scale-[1.02]"
                priority={false}
              />
            </div>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
