import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/admin/session";

export async function POST() {
  return clearAdminSession(NextResponse.json({ ok: true }));
}
