import { findUserById } from "@/lib/auth/users";
import type { User } from "@/lib/auth/types";
import { formatMoney, type PaymentCurrency } from "@/lib/payments/currency";
import { PLANS, type PlanId } from "@/lib/payments/plans";
import { userHasSuccessfulPayment } from "@/lib/payments/records";
import { getBillingConfig } from "./db";
import type {
  BillingConfig,
  BillingPlansResponse,
  ResolvedPlanOffer,
  ResolvedPlanPrice,
} from "./types";

const PLAN_ORDER: PlanId[] = ["monthly", "quarterly", "biannual", "yearly"];

function displayToMinor(display: number): number {
  return Math.round(display * 100);
}

function validDate(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function promoActive(promo: BillingConfig["planPromos"][PlanId], now: Date): boolean {
  if (!promo.enabled) return false;
  const end = validDate(promo.endsAt);
  return !promo.endsAt || (end !== null && end > now);
}

export function isWelcomeTrialWindowActive(config: BillingConfig, now = new Date()): boolean {
  if (!config.welcomeTrial.enabled) return false;
  const start = validDate(config.welcomeTrial.startsAt);
  const end = validDate(config.welcomeTrial.endsAt);
  if (!start || !end) return false;
  return start <= now && end > now;
}

export function isUserEligibleForWelcomeTrial(
  config: BillingConfig,
  user: Pick<User, "createdAt" | "welcomeTrialStartedAt" | "premiumStatus">,
  hasPaid: boolean,
  now = new Date(),
): boolean {
  const start = validDate(config.welcomeTrial.startsAt);
  return Boolean(
    isWelcomeTrialWindowActive(config, now) &&
      start &&
      user.createdAt >= start &&
      !user.welcomeTrialStartedAt &&
      !hasPaid &&
      user.premiumStatus !== "active" &&
      user.premiumStatus !== "pending",
  );
}

export function resolvePlanPrice(
  config: BillingConfig,
  planId: PlanId,
  currency: PaymentCurrency,
  opts: { now?: Date } = {},
): ResolvedPlanPrice {
  const now = opts.now ?? new Date();
  const promo = config.planPromos[planId];

  if (promoActive(promo, now) && promo.prices[currency] > 0) {
    const display = promo.prices[currency];
    return {
      planId,
      display,
      amountMinor: displayToMinor(display),
      pricingKind: "promo",
      promoLabel: promo.label || undefined,
    };
  }

  const display = config.plans[planId][currency];
  return {
    planId,
    display,
    amountMinor: displayToMinor(display),
    pricingKind: "standard",
  };
}

function savingsLabel(planId: PlanId, currency: PaymentCurrency, config: BillingConfig) {
  const full = config.plans.monthly[currency] * PLANS[planId].months;
  const saved = full - config.plans[planId][currency];
  return saved > 0 ? `Save ${formatMoney(saved, currency)}` : undefined;
}

export function buildResolvedPlans(
  config: BillingConfig,
  currency: PaymentCurrency,
): ResolvedPlanOffer[] {
  return PLAN_ORDER.map((id) => {
    const plan = PLANS[id];
    const resolved = resolvePlanPrice(config, id, currency);
    return {
      id,
      name: plan.name,
      months: plan.months,
      display: resolved.display,
      amountMinor: resolved.amountMinor,
      pricingKind: resolved.pricingKind,
      badge: plan.badge,
      savings: id === "monthly" ? undefined : { [currency]: savingsLabel(id, currency, config) },
      promoLabel: resolved.promoLabel,
    };
  });
}

export async function getBillingPlansForUser(
  userId: string | null,
  currency: PaymentCurrency,
): Promise<BillingPlansResponse> {
  const config = await getBillingConfig();
  const active = isWelcomeTrialWindowActive(config);
  let eligible = false;

  if (userId && active) {
    const [user, hasPaid] = await Promise.all([
      findUserById(userId),
      userHasSuccessfulPayment(userId),
    ]);
    eligible = Boolean(user && isUserEligibleForWelcomeTrial(config, user, hasPaid));
  }

  return {
    currency,
    plans: buildResolvedPlans(config, currency),
    trial: {
      active,
      eligible,
      startsAt: config.welcomeTrial.startsAt,
      endsAt: config.welcomeTrial.endsAt,
      durationDays: config.welcomeTrial.durationDays,
      bannerTitle: config.welcomeTrial.bannerTitle,
      bannerBody: config.welcomeTrial.bannerBody,
    },
    welcome: config.welcome,
  };
}

export async function resolveChargeForUser(
  _userId: string,
  planId: PlanId,
  currency: PaymentCurrency,
): Promise<ResolvedPlanPrice> {
  return resolvePlanPrice(await getBillingConfig(), planId, currency);
}
