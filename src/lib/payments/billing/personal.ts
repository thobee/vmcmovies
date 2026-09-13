import type { PremiumStatus } from "@/lib/auth/types";
import { formatMoney, type PaymentCurrency } from "@/lib/payments/currency";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import { getBillingPlansForUser } from "@/lib/payments/billing/resolve";
import type { PersonalNotification } from "./types";

const MS_DAY = 24 * 60 * 60 * 1000;

export async function buildPersonalNotifications(
  userId: string,
  premiumStatus: PremiumStatus,
  premiumExpiryDate: string | null,
): Promise<PersonalNotification[]> {
  const now = Date.now();
  const items: PersonalNotification[] = [];
  const billing = await getBillingPlansForUser(userId, "NGN");

  if (premiumStatus === "active" && premiumExpiryDate) {
    const expiry = new Date(premiumExpiryDate).getTime();
    const daysLeft = Math.ceil((expiry - now) / MS_DAY);

    if (daysLeft > 0 && daysLeft <= 3) {
      const label = new Date(premiumExpiryDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      items.push({
        id: `prem-exp-${premiumExpiryDate.slice(0, 10)}`,
        kind: "premium_expiring",
        title: daysLeft === 1 ? "Premium ends tomorrow" : `Premium ends in ${daysLeft} days`,
        body: `Your access continues until ${label}. Pick a plan on Get Access to keep downloads — no auto-charge.`,
        href: "/get-access",
        publishedAt: new Date().toISOString(),
      });
    }
  }

  if (premiumStatus === "expired" && premiumExpiryDate) {
    const expiredAt = new Date(premiumExpiryDate).getTime();
    const daysSince = Math.floor((now - expiredAt) / MS_DAY);
    if (daysSince >= 0 && daysSince <= 7) {
      items.push({
        id: `prem-ended-${premiumExpiryDate.slice(0, 10)}`,
        kind: "premium_expired",
        title: "Premium has ended",
        body: "Telegram downloads are paused. Continue from ₦1,000/month or save with a longer plan.",
        href: "/get-access",
        publishedAt: premiumExpiryDate,
      });
    }
  }

  if (billing.launchYearlyUpsell.show) {
    items.push({
      id: "prem-launch-biannual",
      kind: "premium_upsell",
      title: "Lock in 6 months",
      body: billing.launchYearlyUpsell.message,
      href: "/get-access",
      publishedAt: new Date().toISOString(),
    });
  }

  return items;
}

export async function getPersonalNotificationsForSession(): Promise<PersonalNotification[]> {
  const session = await getSession();
  if (!session) return [];

  const user = await findUserById(session.user.id);
  if (!user) return [];

  const status =
    user.premiumStatus === "active" &&
    user.premiumExpiryDate &&
    user.premiumExpiryDate < new Date()
      ? "expired"
      : user.premiumStatus;

  return buildPersonalNotifications(
    user._id,
    status,
    user.premiumExpiryDate?.toISOString() ?? null,
  );
}
