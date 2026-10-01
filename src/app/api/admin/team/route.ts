import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/session";
import { canAdmin } from "@/lib/admin/permissions";
import {
  countAdmins,
  findUserById,
  listTeamUsers,
  resetAdminMfaById,
  setUserRole,
} from "@/lib/auth/users";

async function requireFullAdmin() {
  const admin = await getAdminSession();
  if (!admin) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!canAdmin(admin.role, "team")) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { admin };
}

export async function GET(request: Request) {
  const auth = await requireFullAdmin();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  try {
    const users = await listTeamUsers(q);
    return NextResponse.json({ users, currentAdminId: auth.admin.userId });
  } catch (err) {
    console.error("[admin/team GET]", err);
    return NextResponse.json({ error: "Failed to load team" }, { status: 500 });
  }
}

const patchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("role"),
    userId: z.string().min(1),
    role: z.enum(["user", "admin", "content_admin"]),
  }),
  z.object({
    action: z.literal("reset_mfa"),
    userId: z.string().min(1),
  }),
]);

export async function PATCH(request: Request) {
  const auth = await requireFullAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    if (parsed.data.action === "reset_mfa") {
      const target = await resetAdminMfaById(parsed.data.userId);
      if (!target) return NextResponse.json({ error: "Admin not found" }, { status: 404 });
      return NextResponse.json({ user: target });
    }

    if (parsed.data.userId === auth.admin.userId) {
      return NextResponse.json({ error: "You cannot change your own admin role." }, { status: 400 });
    }

    const existing = await findUserById(parsed.data.userId);
    if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (existing.role === "admin" && parsed.data.role !== "admin") {
      const fullAdmins = await countAdmins();
      if (fullAdmins <= 1) {
        return NextResponse.json(
          { error: "At least one full admin must remain." },
          { status: 400 },
        );
      }
    }

    const user = await setUserRole(parsed.data.userId, parsed.data.role);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (err) {
    console.error("[admin/team PATCH]", err);
    return NextResponse.json({ error: "Team update failed" }, { status: 500 });
  }
}
