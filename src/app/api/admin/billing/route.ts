import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/session";
import { canAdmin } from "@/lib/admin/permissions";
import { getBillingConfig, saveBillingConfig } from "@/lib/payments/billing/db";
import type { BillingConfig } from "@/lib/payments/billing/types";

const priceSchema = z.object({ NGN: z.coerce.number().min(0), GHS: z.coerce.number().min(0) });

const patchSchema = z.object({
  plans: z
    .object({
      monthly: priceSchema.optional(),
      quarterly: priceSchema.optional(),
      biannual: priceSchema.optional(),
      yearly: priceSchema.optional(),
    })
    .optional(),
  welcomeTrial: z
    .object({
      enabled: z.boolean().optional(),
      startsAt: z.string().nullable().optional(),
      endsAt: z.string().nullable().optional(),
      bannerTitle: z.string().max(120).optional(),
      bannerBody: z.string().max(300).optional(),
      durationDays: z.coerce.number().int().min(1).max(30).optional(),
    })
    .optional(),
  planPromos: z
    .object({
      monthly: z
        .object({
          enabled: z.boolean(),
          endsAt: z.string().nullable(),
          prices: priceSchema,
          label: z.string().max(80),
        })
        .optional(),
      quarterly: z
        .object({
          enabled: z.boolean(),
          endsAt: z.string().nullable(),
          prices: priceSchema,
          label: z.string().max(80),
        })
        .optional(),
      biannual: z
        .object({
          enabled: z.boolean(),
          endsAt: z.string().nullable(),
          prices: priceSchema,
          label: z.string().max(80),
        })
        .optional(),
      yearly: z
        .object({
          enabled: z.boolean(),
          endsAt: z.string().nullable(),
          prices: priceSchema,
          label: z.string().max(80),
        })
        .optional(),
    })
    .optional(),
  welcome: z
    .object({
      enabled: z.boolean().optional(),
      title: z.string().max(120).optional(),
      intro: z.string().max(400).optional(),
      watchFirstLabel: z.string().max(80).optional(),
      watchFirstHref: z.string().max(200).optional(),
      downloadSteps: z.string().max(600).optional(),
    })
    .optional(),
});

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canAdmin(admin.role, "billing")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const config = await getBillingConfig();
  return NextResponse.json({ config });
}

export async function PUT(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canAdmin(admin.role, "billing")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const current = await getBillingConfig();
    const patch = parsed.data as Partial<BillingConfig>;
    const nextTrial = { ...current.welcomeTrial, ...patch.welcomeTrial };
    if (nextTrial.enabled) {
      const startsAt = nextTrial.startsAt ? new Date(nextTrial.startsAt) : null;
      const endsAt = nextTrial.endsAt ? new Date(nextTrial.endsAt) : null;
      if (
        !startsAt ||
        !endsAt ||
        Number.isNaN(startsAt.getTime()) ||
        Number.isNaN(endsAt.getTime()) ||
        endsAt <= startsAt
      ) {
        return NextResponse.json(
          { error: "Set a valid campaign start and end time before enabling the trial" },
          { status: 400 },
        );
      }
    }
    const config = await saveBillingConfig({
      ...current,
      ...patch,
      plans: { ...current.plans, ...patch.plans },
      welcomeTrial: nextTrial,
      planPromos: { ...current.planPromos, ...patch.planPromos },
      welcome: { ...current.welcome, ...patch.welcome },
    });

    return NextResponse.json({ config });
  } catch (err) {
    console.error("[admin/billing PUT]", err);
    return NextResponse.json({ error: "Could not save billing settings" }, { status: 500 });
  }
}
