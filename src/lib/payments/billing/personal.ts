import type { PremiumStatus } from "@/lib/auth/types";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import { userHasSuccessfulPayment } from "@/lib/payments/records";
import { getBillingConfig } from "./db";
import { isUserEligibleForWelcomeTrial } from "./resolve";
import type { PersonalNotification } from "./types";

const MS_DAY = 24 * 60 * 60 * 1000;

export async function buildPersonalNotifications(
  _userId: string,
  premiumStatus: PremiumStatus,
  premiumExpiryDate: string | null,
): Promise<PersonalNotification[]> {
  const now = Date.now();
  const items: PersonalNotification[] = [];

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
        body: "Premium downloads are paused. Continue from ₦1,000/month or save with a longer plan.",
        href: "/get-access",
        publishedAt: premiumExpiryDate,
      });
    }
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

  const [items, billing, hasPaid] = await Promise.all([
    buildPersonalNotifications(
      user._id,
      status,
      user.premiumExpiryDate?.toISOString() ?? null,
    ),
    getBillingConfig(),
    userHasSuccessfulPayment(user._id),
  ]);

  if (isUserEligibleForWelcomeTrial(billing, user, hasPaid)) {
    items.unshift({
      id: `trial-available-${billing.welcomeTrial.endsAt?.slice(0, 10) ?? "launch"}`,
      kind: "trial_available",
      title: billing.welcomeTrial.bannerTitle,
      body: `Your account qualifies for ${billing.welcomeTrial.durationDays} days of Premium. Open a Premium title to activate it. No card required.`,
      href: "/movies",
      publishedAt: billing.updatedAt,
    });
  }

  return items;
}
