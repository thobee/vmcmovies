import Link from "next/link";
import {
  Camera,
  Clapperboard,
  Crosshair,
  Eye,
  Ghost,
  Heart,
  Landmark,
  Laugh,
  Palette,
  Rocket,
  Sparkles,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface GenreCardProps {
  genre: string;
  href: string;
  className?: string;
}

const GENRE_CONFIG: Record<string, { gradient: string; icon: LucideIcon }> = {
  "Sci-Fi":      { gradient: "from-[#0f1c4d] via-[#1a2a6c] to-[#0a0a14]", icon: Rocket },
  "Action":      { gradient: "from-[#4d0f0f] via-[#7a1a1a] to-[#1a0a0a]", icon: Crosshair },
  "Drama":       { gradient: "from-[#2d0f4d] via-[#4a1a7a] to-[#0f0a1a]", icon: Sparkles },
  "Fantasy":     { gradient: "from-[#0f3d1c] via-[#1a5c2a] to-[#050f08]", icon: Wand2 },
  "Comedy":      { gradient: "from-[#4d3d0f] via-[#7a5a1a] to-[#1a1205]", icon: Laugh },
  "Crime":       { gradient: "from-[#1a1a1a] via-[#2a2a2a] to-[#0a0a0a]", icon: Eye },
  "Thriller":    { gradient: "from-[#3d0f0f] via-[#5c1a1a] to-[#0f0505]", icon: Eye },
  "Horror":      { gradient: "from-[#0a0a0a] via-[#1a0a0a] to-[#050505]", icon: Ghost },
  "Romance":     { gradient: "from-[#4d0f2d] via-[#7a1a4a] to-[#1a050f]", icon: Heart },
  "Animation":   { gradient: "from-[#0f2d4d] via-[#1a4a7a] to-[#050f1a]", icon: Palette },
  "Documentary": { gradient: "from-[#0f3d10] via-[#1a5c20] to-[#050f05]", icon: Camera },
  "History":     { gradient: "from-[#3d2d0f] via-[#5c4a1a] to-[#0f0c05]", icon: Landmark },
};

export default function GenreCard({ genre, href, className }: GenreCardProps) {
  const config = GENRE_CONFIG[genre] ?? {
    gradient: "from-[#1a1a22] via-[#252530] to-[#0a0a0c]",
    icon: Clapperboard,
  };
  const Icon = config.icon;

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex-shrink-0 w-[140px] md:w-[168px] h-[88px] md:h-[100px] rounded-2xl overflow-hidden cursor-pointer border border-[var(--border)] hover:border-[var(--amber)]/25 transition-all duration-300",
        className
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", config.gradient)} />

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "radial-gradient(ellipse at 50% 120%, rgba(91,141,239,0.14) 0%, transparent 70%)" }}
      />

      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(rgba(157,178,191,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(157,178,191,0.35) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <Icon
        className="absolute -right-2 -bottom-2 w-16 h-16 opacity-15 group-hover:opacity-25 transition-opacity pointer-events-none"
        strokeWidth={1.25}
      />

      <div className="absolute inset-0 flex flex-col items-start justify-end p-3.5">
        <Icon className="w-4 h-4 text-white/70 mb-1 group-hover:text-[var(--amber-100)] group-hover:scale-110 transition-all origin-left" strokeWidth={2} />
        <span
          className="text-white text-sm font-bold leading-none group-hover:text-[var(--amber-100)] transition-colors"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.01em" }}
        >
          {genre.toUpperCase()}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
        style={{ background: "linear-gradient(90deg, var(--amber), transparent)" }}
      />
    </Link>
  );
}
