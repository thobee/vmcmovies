import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";
import { isTmdbConfigured, tmdbDetails, tmdbSearch } from "@/lib/tmdb/client";

export async function GET(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isTmdbConfigured()) {
    return NextResponse.json(
      { error: "TMDB_API_KEY is not configured on this server" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const q = searchParams.get("q");
  const tmdbId = searchParams.get("tmdbId");

  if (type !== "movie" && type !== "series") {
    return NextResponse.json({ error: "type must be movie or series" }, { status: 400 });
  }

  try {
    if (tmdbId) {
      const id = Number(tmdbId);
      if (!Number.isInteger(id) || id <= 0) {
        return NextResponse.json({ error: "tmdbId must be a positive integer" }, { status: 400 });
      }
      const details = await tmdbDetails(type, id);
      return NextResponse.json({ details });
    }

    if (!q?.trim()) {
      return NextResponse.json({ error: "q is required" }, { status: 400 });
    }

    const results = await tmdbSearch(type, q.trim());
    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "TMDB request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
