import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";
import { homepageSettingsSchema } from "@/lib/admin/homepage-validation";
import { dbGetHomepageSettings, dbSaveHomepageSettings } from "@/lib/site/homepage";

async function requireAdmin() {
  return getAdminSession();
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await dbGetHomepageSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    console.error("[admin/homepage GET]", err);
    return NextResponse.json({ error: "Failed to load homepage settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = homepageSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const settings = await dbSaveHomepageSettings(parsed.data);
    return NextResponse.json({ settings });
  } catch (err) {
    console.error("[admin/homepage PUT]", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
