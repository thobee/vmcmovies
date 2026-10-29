import type { ResolvedPlanOffer } from "./types";
import { formatMoney } from "../currency";

/** The plan everyone is nudged toward: "Most popular" label, green highlight. */
export const FEATURED_PLAN_ID = "quarterly";

/** Promo label, else savings versus paying monthly, else a short monthly-plan note. */
export function planHighlight(plan: ResolvedPlanOffer, monthlyPrice: number) {
  if (plan.promoLabel) return plan.promoLabel;
  const savings = monthlyPrice * plan.months - plan.display;
  if (savings > 0) return `Save ${formatMoney(savings, "NGN")}`;
  return plan.months === 1 ? "Flexible, no commitment" : "Full Premium access";
}
