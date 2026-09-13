import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

const LOGO = "/VMC.png";

/** Source asset is 612×408. */
const RATIO = 1.5;

type VmcLogoProps = {
  className?: string;
  height?: number;
  href?: string;
  priority?: boolean;
  admin?: boolean;
};

export default function VmcLogo({
  className,
  height = 44,
  href,
  priority,
  admin,
}: VmcLogoProps) {
  const width = Math.round(height * RATIO);
  const img = (
    <Image
      src={LOGO}
      alt="VMC"
      width={width}
      height={height}
      className={cn("h-auto w-auto object-contain", className)}
      style={{ height, width: "auto", maxWidth: width }}
      priority={priority}
    />
  );

  const content = admin ? (
    <span className="inline-flex items-center gap-2.5">
      {img}
      <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/40">Admin</span>
    </span>
  ) : (
    img
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return <span className="inline-flex shrink-0">{content}</span>;
}
