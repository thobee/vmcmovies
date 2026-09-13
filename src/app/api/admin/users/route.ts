import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/session";
import { listUsers, setUserPremiumStatus } from "@/lib/auth/users";
import type { PremiumStatus } from "@/lib/auth/types";

async function requireAdmin() {
  return getAdminSession();
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await listUsers();
    return NextResponse.json({ users });
  } catch (err) {
    console.error("[admin/users GET]", err);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}

const patchSchema = z.object({
  userId: z.string().min(1),
  premiumStatus: z.enum(["none", "active", "expired", "pending"]),
});

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const user = await setUserPremiumStatus(
      parsed.data.userId,
      parsed.data.premiumStatus as PremiumStatus
    );
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("[admin/users PATCH]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
