import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";
import { inputToContent } from "@/lib/admin/content";
import { notifyNewContent } from "@/lib/admin/notify-content";
import { contentInputSchema } from "@/lib/admin/validation";
import {
  dbCreateContent,
  dbGetAllContent,
} from "@/lib/catalog/db";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) return null;
  return session;
}

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  try {
    const items = await dbGetAllContent(
      type === "movie" || type === "series"
        ? { search: undefined, limit: undefined }
        : undefined
    );

    const filtered =
      type === "movie" || type === "series"
        ? items.filter((item) => item.type === type)
        : items;

    return NextResponse.json({ items: filtered });
  } catch (err) {
    console.error("[admin/content GET]", err);
    return NextResponse.json({ error: "Failed to load content" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const notifyUsers = body.notifyUsers !== false;
    const { notifyUsers: _ignore, ...contentBody } = body;

    const parsed = contentInputSchema.safeParse(contentBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const content = inputToContent(parsed.data);
    await dbCreateContent(content, { featured: parsed.data.featured });

    if (notifyUsers) {
      await notifyNewContent(content);
    }

    return NextResponse.json({ item: content, notified: notifyUsers }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    console.error("[admin/content POST]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
