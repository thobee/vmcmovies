import { formatMoney, type PaymentCurrency } from "./currency";

export type PlanId = "monthly" | "quarterly" | "biannual" | "yearly";
/** @deprecated Use PlanId. Kept for compatibility with older imports. */
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
      NGN: { amountMinor: 280_000, display: 2_800 },
    },
    badge: "Most Popular",
    savings: {
      NGN: `Save ${formatMoney(NGN_MONTHLY * 3 - 2_800, "NGN")}`,
    },
  },
  biannual: {
    id: "biannual",
    name: "6 Months",
    months: 6,
    pricing: {
      NGN: { amountMinor: 520_000, display: 5_200 },
    },
    savings: {
      NGN: `Save ${formatMoney(NGN_MONTHLY * 6 - 5_200, "NGN")}`,
    },
  },
  yearly: {
    id: "yearly",
    name: "12 Months",
    months: 12,
    pricing: {
      NGN: { amountMinor: 960_000, display: 9_600 },
    },
    badge: "Best Value",
    savings: {
      NGN: `Save ${formatMoney(NGN_MONTHLY * 12 - 9_600, "NGN")}`,
    },
  },
};

export const PLAN_LIST: Plan[] = [
  PLANS.monthly,
  PLANS.quarterly,
  PLANS.biannual,
  PLANS.yearly,
];

export const PREMIUM_FEATURES = [
  "Unlimited Telegram downloads",
  "All movies & series",
  "New episodes as they drop",
  "Telegram channel access",
  "Request movies",
];

const ALL_PLAN_IDS = new Set<string>(["monthly", "quarterly", "biannual", "yearly"]);

export function isPlanId(value: string): value is PlanId {
  return ALL_PLAN_IDS.has(value);
}

export function isKnownPlanId(value: string): boolean {
  return ALL_PLAN_IDS.has(value);
}

export function getPlanMonths(planId: string): number {
  if (isPlanId(planId)) return PLANS[planId].months;
  return 1;
}

export function getPlanPricing(planId: PlanId, _currency: PaymentCurrency = "NGN"): PlanPricing {
  void _currency;
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
