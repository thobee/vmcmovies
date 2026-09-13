import { NextResponse } from "next/server";
import { getPublishedUpdates } from "@/lib/site/updates";
import { getPersonalNotificationsForSession } from "@/lib/payments/billing/personal";

export type NotificationItem = {
  id: string;
  kind: string;
  title: string;
  body: string;
  href?: string;
  publishedAt: string;
  source: "site" | "account";
};

export async function GET() {
  try {
    const [siteItems, personal] = await Promise.all([
      getPublishedUpdates(),
      getPersonalNotificationsForSession(),
    ]);

    const items: NotificationItem[] = [
      ...personal.map((p) => ({
        id: p.id,
        kind: p.kind,
        title: p.title,
        body: p.body,
        href: p.href,
        publishedAt: p.publishedAt,
        source: "account" as const,
      })),
      ...siteItems.map((u) => ({
        id: u.id,
        kind: u.kind,
        title: u.title,
        body: u.body,
        href: u.href,
        publishedAt: u.publishedAt,
        source: "site" as const,
      })),
    ].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return NextResponse.json({ items });
  } catch (err) {
    console.error("[notifications GET]", err);
    return NextResponse.json({ items: [] });
  }
}
