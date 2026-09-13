import { NextResponse } from "next/server";
import { getPublishedUpdates } from "@/lib/site/updates";

export async function GET() {
  try {
    const items = await getPublishedUpdates();
    return NextResponse.json({ items });
  } catch (err) {
    console.error("[updates GET]", err);
    return NextResponse.json({ items: [] });
  }
}
