import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";
import { siteUpdateSchema } from "@/lib/admin/updates-validation";
import { dbCreateUpdate, dbListAllUpdates } from "@/lib/site/updates/db";

async function requireAdmin() {
  return getAdminSession();
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await dbListAllUpdates();
    return NextResponse.json({ items });
  } catch (err) {
    console.error("[admin/updates GET]", err);
    return NextResponse.json({ error: "Failed to load updates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = siteUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const item = await dbCreateUpdate(parsed.data);
    return NextResponse.json({ item });
  } catch (err) {
    console.error("[admin/updates POST]", err);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
