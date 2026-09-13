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
  };
  launchOffer: {
    enabled: boolean;
    endsAt: string | null;
    bannerTitle: string;
    bannerBody: string;
    monthlyPrice: CurrencyPrices;
    disclosure: Record<PaymentCurrency, string>;
  };
  planPromos: Record<PlanId, PlanPromo>;
  launchYearlyUpsell: {
    enabled: boolean;
    message: Record<PaymentCurrency, string>;
  };
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
  isLaunchMonthly?: boolean;
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
  kind: "premium_expiring" | "premium_expired" | "premium_upsell";
  title: string;
  body: string;
  href?: string;
  publishedAt: string;
};

export type BillingPlansResponse = {
  currency: PaymentCurrency;
  plans: ResolvedPlanOffer[];
  launch: {
    active: boolean;
    eligible: boolean;
    endsAt: string | null;
    bannerTitle: string;
    bannerBody: string;
    disclosure: string;
  };
  launchYearlyUpsell: {
    show: boolean;
    message: string;
  };
  welcome: BillingConfig["welcome"];
};
