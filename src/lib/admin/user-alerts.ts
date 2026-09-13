import { getDb } from "@/lib/db/mongodb";
import { listUsers, type PublicUser } from "@/lib/auth/users";
import { getPlanMonths, isKnownPlanId, isPlanId, PLANS, type PlanId } from "@/lib/payments/plans";
import type { Document } from "mongodb";

const SUBSCRIBED_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
const EXPIRED_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export type UserAlertKind = "subscribed" | "expired";

export type UserAlert = {
  id: string;
  kind: UserAlertKind;
  userId: string;
  email: string;
  telegramUsername: string;
  planId: PlanId | null;
  planName: string;
  at: string;
};

function planLabel(planId: string | null | undefined): {
  planId: PlanId | null;
  planName: string;
} {
  if (planId === "yearly") return { planId: null, planName: "12 Months" };
  if (planId && isPlanId(planId)) {
    return { planId, planName: PLANS[planId].name };
  }
  if (planId && isKnownPlanId(planId)) {
    return { planId: null, planName: `${getPlanMonths(planId)} Months` };
  }
  return { planId: null, planName: "Premium" };
}

async function latestPlanByUserIds(
  userIds: string[]
): Promise<Map<string, { planId: string; at: Date }>> {
  const map = new Map<string, { planId: string; at: Date }>();
  if (userIds.length === 0) return map;

  const db = await getDb();
  const rows = await db
    .collection("payments")
    .aggregate<{ _id: string; planId: string; at: Date }>([
      { $match: { status: "success", userId: { $in: userIds } } },
      { $sort: { paidAt: -1, createdAt: -1 } },
      {
        $group: {
          _id: "$userId",
          planId: { $first: "$planId" },
          at: { $first: { $ifNull: ["$paidAt", "$createdAt"] } },
        },
      },
    ])
    .toArray();

  for (const row of rows) {
    map.set(row._id, {
      planId: row.planId,
      at: row.at instanceof Date ? row.at : new Date(row.at),
    });
  }
  return map;
}

async function recentSuccessfulPayments(since: Date): Promise<
  { userId: string; planId: string; at: Date; reference: string }[]
> {
  const db = await getDb();
  const docs = await db
    .collection("payments")
    .find({
      status: "success",
      premiumActivated: true,
      $or: [{ paidAt: { $gte: since } }, { paidAt: null, createdAt: { $gte: since } }],
    })
    .sort({ paidAt: -1, createdAt: -1 })
    .limit(50)
    .project({ userId: 1, planId: 1, paidAt: 1, createdAt: 1, reference: 1 })
    .toArray();

  return docs.map((d: Document) => {
    const paidAt = d.paidAt instanceof Date ? d.paidAt : null;
    const createdAt = d.createdAt instanceof Date ? d.createdAt : since;
    return {
      userId: String(d.userId),
      planId: String(d.planId),
      reference: String(d.reference),
      at: paidAt ?? createdAt,
    };
  });
}

export async function listUserAlerts(
  knownUsers?: PublicUser[]
): Promise<UserAlert[]> {
  const now = new Date();
  const subscribedSince = new Date(now.getTime() - SUBSCRIBED_WINDOW_MS);
  const expiredSince = new Date(now.getTime() - EXPIRED_WINDOW_MS);

  const users = knownUsers ?? (await listUsers());
  const userById = new Map(users.map((u) => [u._id, u]));

  const recentPays = await recentSuccessfulPayments(subscribedSince);
  const subscribed: UserAlert[] = [];
  const seenSub = new Set<string>();

  for (const pay of recentPays) {
    if (seenSub.has(pay.userId)) continue;
    seenSub.add(pay.userId);
    const user = userById.get(pay.userId);
    if (!user) continue;
    if (user.premiumStatus !== "active" && user.premiumStatus !== "pending") continue;
    const plan = planLabel(pay.planId);
    subscribed.push({
      id: `sub-${pay.reference}`,
      kind: "subscribed",
      userId: pay.userId,
      email: user.email,
      telegramUsername: user.telegramUsername,
      planId: plan.planId,
      planName: plan.planName,
      at: pay.at.toISOString(),
    });
  }

  const expiredUsers = users.filter((u) => {
    if (u.premiumStatus !== "expired") return false;
    if (!u.premiumExpiryDate) return true;
    const expiry = new Date(u.premiumExpiryDate);
    return expiry >= expiredSince && expiry <= now;
  });

  const planMap = await latestPlanByUserIds(expiredUsers.map((u) => u._id));
  const expired: UserAlert[] = expiredUsers.map((u) => {
    const latest = planMap.get(u._id);
    const plan = planLabel(latest?.planId);
    const atIso = u.premiumExpiryDate ?? latest?.at.toISOString() ?? u.createdAt;
    return {
      id: `exp-${u._id}`,
      kind: "expired" as const,
      userId: u._id,
      email: u.email,
      telegramUsername: u.telegramUsername,
      planId: plan.planId,
      planName: plan.planName,
      at: atIso,
    };
  });

  return [...subscribed, ...expired].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );
}
