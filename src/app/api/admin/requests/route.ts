import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/session";
import {
  countOpenTitleRequests,
  listTitleRequests,
  setTitleRequestStatus,
} from "@/lib/requests/db";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requests = await listTitleRequests(100);
    const open = await countOpenTitleRequests();
    return NextResponse.json({ requests, open });
  } catch (err) {
    console.error("[admin/requests GET]", err);
    return NextResponse.json({ error: "Failed to load requests" }, { status: 500 });
  }
}

const patchSchema = z.object({
  requestId: z.string().min(1),
  status: z.enum(["open", "done"]),
});

export async function PATCH(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const item = await setTitleRequestStatus(parsed.data.requestId, parsed.data.status);
    if (!item) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ request: item });
  } catch (err) {
    console.error("[admin/requests PATCH]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
