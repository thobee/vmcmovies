import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ admin: null });
  }
  return NextResponse.json({ admin: session });
}
