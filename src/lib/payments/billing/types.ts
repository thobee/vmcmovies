import type { PaymentCurrency } from "@/lib/payments/currency";
import type { PlanId } from "@/lib/payments/plans";

export type CurrencyPrices = Record<PaymentCurrency, number>;

export type PlanPromo = {
  enabled: boolean;
  endsAt: string | null;
  prices: CurrencyPrices;
  label: string;
};

export type BillingConfig = {
  plans: {
    monthly: CurrencyPrices;
    quarterly: CurrencyPrices;
    biannual: CurrencyPrices;
    yearly: CurrencyPrices;
  };
  welcomeTrial: {
    enabled: boolean;
    startsAt: string | null;
    endsAt: string | null;
    bannerTitle: string;
    bannerBody: string;
    durationDays: number;
  };
  planPromos: Record<PlanId, PlanPromo>;
  welcome: {
    enabled: boolean;
    title: string;
    intro: string;
    watchFirstLabel: string;
    watchFirstHref: string;
    downloadSteps: string;
  };
  updatedAt: string;
};

export type PricingKind = "launch" | "promo" | "standard";

export type ResolvedPlanPrice = {
  planId: PlanId;
  display: number;
  amountMinor: number;
  pricingKind: PricingKind;
  promoLabel?: string;
};

export type ResolvedPlanOffer = {
  id: PlanId;
  name: string;
  months: number;
  display: number;
  amountMinor: number;
  pricingKind: PricingKind;
  badge?: string;
  savings?: Partial<Record<PaymentCurrency, string>>;
  promoLabel?: string;
  footnote?: string;
};

export type PersonalNotification = {
  id: string;
  kind: "trial_available" | "premium_expiring" | "premium_expired";
  title: string;
  body: string;
  href?: string;
  publishedAt: string;
};

export type BillingPlansResponse = {
  currency: PaymentCurrency;
  plans: ResolvedPlanOffer[];
  trial: {
    active: boolean;
    eligible: boolean;
    startsAt: string | null;
    endsAt: string | null;
    durationDays: number;
    bannerTitle: string;
    bannerBody: string;
  };
  welcome: BillingConfig["welcome"];
};
