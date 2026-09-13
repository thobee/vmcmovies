import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/session";
import {
  listSupportTickets,
  setSupportTicketStatus,
} from "@/lib/support/db";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tickets = await listSupportTickets(100);
    const open = tickets.filter((t) => t.status === "open").length;
    return NextResponse.json({ tickets, open });
  } catch (err) {
    console.error("[admin/support GET]", err);
    return NextResponse.json({ error: "Failed to load tickets" }, { status: 500 });
  }
}

const patchSchema = z.object({
  ticketId: z.string().min(1),
  status: z.enum(["open", "resolved"]),
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
        { status: 400 }
      );
    }

    const ticket = await setSupportTicketStatus(parsed.data.ticketId, parsed.data.status);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (err) {
    console.error("[admin/support PATCH]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
