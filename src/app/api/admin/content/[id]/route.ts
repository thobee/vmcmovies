import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";
import { inputToContent } from "@/lib/admin/content";
import { contentInputSchema } from "@/lib/admin/validation";
import {
  dbDeleteContent,
  dbGetContentBySlugOrId,
  dbSetFeatured,
  dbUpdateContent,
} from "@/lib/catalog/db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) return null;
  return session;
}

export async function GET(_request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const item = await dbGetContentBySlugOrId(id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ item });
}

export async function PUT(request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: param } = await context.params;

  try {
    const existing = await dbGetContentBySlugOrId(param);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = contentInputSchema.safeParse({ ...body, id: existing.id });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    if (parsed.data.id !== existing.id) {
      return NextResponse.json({ error: "ID cannot be changed" }, { status: 400 });
    }

    const content = inputToContent(parsed.data);
    const item = await dbUpdateContent(existing.id, {
      ...content,
      createdAt: existing.createdAt,
      featured: parsed.data.featured,
    });

    return NextResponse.json({ item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    console.error("[admin/content PUT]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: param } = await context.params;
  const existing = await dbGetContentBySlugOrId(param);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const deleted = await dbDeleteContent(existing.id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: param } = await context.params;
  const body = await request.json();

  if (body.action === "featured") {
    const existing = await dbGetContentBySlugOrId(param);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await dbSetFeatured(existing.id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
