import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";
import { siteUpdateSchema } from "@/lib/admin/updates-validation";
import { dbDeleteSiteUpdate, dbUpdateSiteUpdate } from "@/lib/site/updates/db";

async function requireAdmin() {
  return getAdminSession();
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = siteUpdateSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const item = await dbUpdateSiteUpdate(id, parsed.data);
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch (err) {
    console.error("[admin/updates PUT]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const ok = await dbDeleteSiteUpdate(id);
    if (!ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/updates DELETE]", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
