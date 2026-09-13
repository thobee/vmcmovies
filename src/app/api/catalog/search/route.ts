import { NextRequest, NextResponse } from "next/server";
import { searchContent } from "@/lib/catalog";
import { toPublicContent } from "@/lib/catalog/public";
import { clientIp, rateLimited, RATE_LIMIT_MSG } from "@/lib/security/rate-limit";

export async function GET(request: NextRequest) {
  if (rateLimited(`search:${clientIp(request)}`, 40, 60_000)) {
    return NextResponse.json({ error: RATE_LIMIT_MSG }, { status: 429 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q || q.length > 80) {
    return NextResponse.json({ items: [] });
  }
  const items = await searchContent(q);
  return NextResponse.json({ items: items.slice(0, 24).map(toPublicContent) });
}
