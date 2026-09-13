import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  CreditCard,
  Crown,
  Film,
  Home,
  Layers,
  MessageCircle,
  Tv,
  Users,
} from "lucide-react";
import {
  dbContentCount,
  dbGetMovies,
  dbGetSeriesList,
} from "@/lib/catalog/db";
import { listUsers } from "@/lib/auth/users";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { cn } from "@/lib/cn";

export default async function AdminDashboardPage() {
  let movieCount = 0;
  let seriesCount = 0;
  let total = 0;
  let userCount = 0;
  let premiumCount = 0;

  try {
    const [movies, series, users] = await Promise.all([
      dbGetMovies(),
      dbGetSeriesList(),
      listUsers(),
    ]);
    movieCount = movies.length;
    seriesCount = series.length;
    total = await dbContentCount();
    userCount = users.length;
    premiumCount = users.filter((u) => u.premiumStatus === "active").length;
  } catch {
    // MongoDB may be unavailable — show zeros
  }

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Catalog, subscribers, and site controls in one place."
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-10">
        <StatCard label="Total titles" value={total} icon={Layers} accent="blue" />
        <StatCard label="Movies" value={movieCount} icon={Film} accent="blue" />
        <StatCard label="Series" value={seriesCount} icon={Tv} accent="blue" />
        <StatCard label="Users" value={userCount} icon={Users} accent="neutral" />
        <StatCard label="Premium" value={premiumCount} icon={Crown} accent="gold" />
      </div>

      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/30">
        Quick actions
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <ActionCard
          href="/admin/movies/new"
          icon={Film}
          title="Add movie"
          description="Poster, metadata, and Telegram download link."
        />
        <ActionCard
          href="/admin/series/new"
          icon={Tv}
          title="Add series"
          description="Season buttons — episodes live in the Telegram bot."
        />
        <ActionCard
          href="/admin/updates"
          icon={Bell}
          title="Post updates"
          description="Notify users about news and new movies or series."
        />
        <ActionCard
          href="/admin/homepage"
          icon={Home}
          title="Edit homepage"
          description="Hero carousel slides and section titles."
        />
        <ActionCard
          href="/admin/users"
          icon={Users}
          title="Manage users"
          description="See signups and set premium status."
        />
        <ActionCard
          href="/admin/payments"
          icon={CreditCard}
          title="Payments"
          description="Revenue, Bachs balance, and withdrawals."
        />
        <ActionCard
          href="/admin/support"
          icon={MessageCircle}
          title="Support"
          description="Open tickets from the public support form."
        />
      </div>
    </div>
  );
}

const ACCENTS = {
  blue: "text-[var(--amber)] bg-[var(--amber)]/12",
  gold: "text-[var(--gold,#e8b64c)] bg-[#e8b64c]/12",
  neutral: "text-white/60 bg-white/[0.06]",
} as const;

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: typeof Film;
  accent: keyof typeof ACCENTS;
}) {
  return (
    <div className="rounded-2xl panel p-4 sm:p-5">
      <div
        className={cn(
          "mb-3 flex h-8 w-8 items-center justify-center rounded-lg",
          ACCENTS[accent]
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums">{value}</p>
      <p className="mt-0.5 text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-white/35">
        {label}
      </p>
    </div>
  );
}

function ActionCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof Film;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex gap-4 rounded-2xl panel p-5 transition-all hover:border-(--amber)/35 hover:-translate-y-0.5"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--amber)/12 text-amber transition-colors group-hover:bg-(--amber)/22">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 pr-5">
        <p className="font-semibold text-white text-sm">{title}</p>
        <p className="mt-1 text-xs leading-5 text-white/45">{description}</p>
      </div>
      <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-white/15 transition-all group-hover:text-amber group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}
