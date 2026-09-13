import { formatMoney, type PaymentCurrency } from "./currency";

export type PlanId = "monthly" | "quarterly" | "biannual";
/** @deprecated Legacy plan — existing payments only */
export type LegacyPlanId = "yearly";

export interface PlanPricing {
  amountMinor: number;
  display: number;
}

export interface Plan {
  id: PlanId;
  name: string;
  months: number;
  pricing: { NGN: PlanPricing };
  badge?: string;
  savings?: { NGN: string };
}

const NGN_MONTHLY = 1_000;

export const PLANS: Record<PlanId, Plan> = {
  monthly: {
    id: "monthly",
    name: "1 Month",
    months: 1,
    pricing: {
      NGN: { amountMinor: NGN_MONTHLY * 100, display: NGN_MONTHLY },
    },
  },
  quarterly: {
    id: "quarterly",
    name: "3 Months",
    months: 3,
    pricing: {
      NGN: { amountMinor: 250_000, display: 2_500 },
    },
    badge: "Most Popular",
    savings: {
      NGN: `Save ${formatMoney(NGN_MONTHLY * 3 - 2_500, "NGN")}`,
    },
  },
  biannual: {
    id: "biannual",
    name: "6 Months",
    months: 6,
    pricing: {
      NGN: { amountMinor: 450_000, display: 4_500 },
    },
    badge: "Best Value",
    savings: {
      NGN: `Save ${formatMoney(NGN_MONTHLY * 6 - 4_500, "NGN")}`,
    },
  },
};

export const PLAN_LIST: Plan[] = [PLANS.monthly, PLANS.quarterly, PLANS.biannual];

export const PREMIUM_FEATURES = [
  "Unlimited Telegram downloads",
  "All movies & series",
  "New episodes as they drop",
  "Telegram channel access",
  "Request movies",
];

const ALL_PLAN_IDS = new Set<string>(["monthly", "quarterly", "biannual", "yearly"]);

export function isPlanId(value: string): value is PlanId {
  return value === "monthly" || value === "quarterly" || value === "biannual";
}

export function isKnownPlanId(value: string): boolean {
  return ALL_PLAN_IDS.has(value);
}

export function getPlanMonths(planId: string): number {
  if (planId === "yearly") return 12;
  if (isPlanId(planId)) return PLANS[planId].months;
  return 1;
}

export function getPlanPricing(planId: PlanId, currency: PaymentCurrency = "NGN"): PlanPricing {
  return PLANS[planId].pricing.NGN;
}

export function formatPlanPrice(plan: Plan, currency: PaymentCurrency = "NGN"): string {
  return formatMoney(plan.pricing.NGN.display, currency);
}

export function formatPlanPriceDisplay(display: number, currency: PaymentCurrency = "NGN"): string {
  return formatMoney(display, currency);
}

/** @deprecated Use formatPlanPrice(plan, "NGN") */
export function formatNaira(amount: number): string {
  return formatMoney(amount, "NGN");
}
