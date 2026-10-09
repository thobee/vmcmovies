import { NextRequest, NextResponse } from "next/server";
import { searchContent } from "@/lib/catalog";
import { toPublicContent } from "@/lib/catalog/public";
import { clientIp, rateLimited } from "@/lib/security/rate-limit";

export async function GET(request: NextRequest) {
  try {
    if (await rateLimited(`search:${clientIp(request)}`, 40, 60_000)) {
      return NextResponse.json(
        { error: "Too many searches. Try again in one minute." },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }
    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    if (!q || q.length > 80) {
      return NextResponse.json({ items: [] });
    }
    const items = await searchContent(q);
    return NextResponse.json({ items: items.slice(0, 24).map(toPublicContent) });
  } catch (error) {
    console.error("[catalog/search] Search unavailable", error);
    return NextResponse.json(
      { error: "Search is temporarily unavailable. Please try again shortly." },
      { status: 503, headers: { "Retry-After": "30" } },
    );
  }
}
