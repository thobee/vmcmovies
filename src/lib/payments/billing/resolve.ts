import { formatMoney, type PaymentCurrency } from "@/lib/payments/currency";
import { PLANS, type PlanId } from "@/lib/payments/plans";
import { getBillingConfig } from "./db";
import type {
  BillingConfig,
  BillingPlansResponse,
  PricingKind,
  ResolvedPlanOffer,
  ResolvedPlanPrice,
} from "./types";
import { userHasSuccessfulPayment } from "@/lib/payments/records";

const PLAN_ORDER: PlanId[] = ["monthly", "quarterly", "biannual"];

function displayToMinor(display: number): number {
  return Math.round(display * 100);
}

function promoActive(promo: BillingConfig["planPromos"][PlanId], now: Date): boolean {
  if (!promo.enabled) return false;
  if (!promo.endsAt) return true;
  const end = new Date(promo.endsAt);
  return !Number.isNaN(end.getTime()) && end > now;
}

export function isLaunchOfferWindowActive(config: BillingConfig, now = new Date()): boolean {
  if (!config.launchOffer.enabled) return false;
  if (!config.launchOffer.endsAt) return true;
  const end = new Date(config.launchOffer.endsAt);
  return !Number.isNaN(end.getTime()) && end > now;
}

export function resolvePlanPrice(
  config: BillingConfig,
  planId: PlanId,
  currency: PaymentCurrency,
  opts: { launchEligible: boolean; now?: Date },
): ResolvedPlanPrice {
  const now = opts.now ?? new Date();

  if (
    planId === "monthly" &&
    opts.launchEligible &&
    isLaunchOfferWindowActive(config, now)
  ) {
    const display = config.launchOffer.monthlyPrice[currency];
    return {
      planId,
      display,
      amountMinor: displayToMinor(display),
      pricingKind: "launch",
      isLaunchMonthly: true,
    };
  }

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

function savingsLabel(
  planId: PlanId,
  currency: PaymentCurrency,
  config: BillingConfig,
): string | undefined {
  const plan = PLANS[planId];
  const monthly = config.plans.monthly[currency];
  const price = config.plans[planId][currency];
  const full = monthly * plan.months;
  const saved = full - price;
  if (saved <= 0) return undefined;
  return `Save ${formatMoney(saved, currency)}`;
}

export function buildResolvedPlans(
  config: BillingConfig,
  currency: PaymentCurrency,
  launchEligible: boolean,
): ResolvedPlanOffer[] {
  return PLAN_ORDER.map((id) => {
    const plan = PLANS[id];
    const resolved = resolvePlanPrice(config, id, currency, { launchEligible });
    const badge = resolved.isLaunchMonthly ? "Launch price" : plan.badge;

    let footnote: string | undefined;
    if (resolved.isLaunchMonthly) {
      footnote = config.launchOffer.disclosure[currency];
    }

    return {
      id,
      name: plan.name,
      months: plan.months,
      display: resolved.display,
      amountMinor: resolved.amountMinor,
      pricingKind: resolved.pricingKind,
      badge,
      savings: id === "monthly" ? undefined : { [currency]: savingsLabel(id, currency, config) },
      promoLabel: resolved.promoLabel,
      footnote,
    };
  });
}

export async function getBillingPlansForUser(
  userId: string | null,
  currency: PaymentCurrency,
): Promise<BillingPlansResponse> {
  const config = await getBillingConfig();
  const launchEligible = userId
    ? !(await userHasSuccessfulPayment(userId))
    : false;
  const launchActive = isLaunchOfferWindowActive(config);

  const usedLaunch =
    userId && launchEligible === false
      ? await userUsedLaunchOffer(userId)
      : false;

  return {
    currency,
    plans: buildResolvedPlans(config, currency, launchEligible),
    launch: {
      active: launchActive,
      eligible: launchEligible && launchActive,
      endsAt: config.launchOffer.endsAt,
      bannerTitle: config.launchOffer.bannerTitle,
      bannerBody: config.launchOffer.bannerBody,
      disclosure: config.launchOffer.disclosure[currency],
    },
    launchYearlyUpsell: {
      show: usedLaunch && config.launchYearlyUpsell.enabled,
      message: config.launchYearlyUpsell.message[currency],
    },
    welcome: config.welcome,
  };
}

async function userUsedLaunchOffer(userId: string): Promise<boolean> {
  const { getPaymentsForUser } = await import("@/lib/payments/records");
  const payments = await getPaymentsForUser(userId);
  return payments.some((p) => p.status === "success" && p.pricingKind === "launch");
}

export async function resolveChargeForUser(
  userId: string,
  planId: PlanId,
  currency: PaymentCurrency,
): Promise<ResolvedPlanPrice> {
  const config = await getBillingConfig();
  const launchEligible = !(await userHasSuccessfulPayment(userId));

  if (planId === "monthly" && launchEligible && isLaunchOfferWindowActive(config)) {
    return resolvePlanPrice(config, planId, currency, { launchEligible: true });
  }

  if (planId === "monthly" && launchEligible && !isLaunchOfferWindowActive(config)) {
    // Launch ended — first purchase uses standard monthly, not launch
    return resolvePlanPrice(config, planId, currency, { launchEligible: false });
  }

  if (planId !== "monthly" && launchEligible) {
    // Launch is monthly-only; longer plans use standard/promo pricing
    return resolvePlanPrice(config, planId, currency, { launchEligible: false });
  }

  return resolvePlanPrice(config, planId, currency, { launchEligible });
}
