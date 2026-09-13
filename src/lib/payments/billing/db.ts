import type { Collection, Document } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import { BILLING_DOC_ID, DEFAULT_BILLING_CONFIG } from "./defaults";
import type { BillingConfig } from "./types";

const COLLECTION = "site_billing";

type BillingDoc = Document & BillingConfig & { _id: string };

async function billingCollection(): Promise<Collection<BillingDoc>> {
  return (await getDb()).collection<BillingDoc>(COLLECTION);
}

function mergeConfig(partial: Partial<BillingConfig> | null | undefined): BillingConfig {
  if (!partial) return { ...DEFAULT_BILLING_CONFIG, updatedAt: new Date().toISOString() };

  return {
    plans: {
      monthly: { ...DEFAULT_BILLING_CONFIG.plans.monthly, ...partial.plans?.monthly },
      quarterly: { ...DEFAULT_BILLING_CONFIG.plans.quarterly, ...partial.plans?.quarterly },
      biannual: { ...DEFAULT_BILLING_CONFIG.plans.biannual, ...partial.plans?.biannual },
    },
    launchOffer: {
      ...DEFAULT_BILLING_CONFIG.launchOffer,
      ...partial.launchOffer,
      monthlyPrice: {
        ...DEFAULT_BILLING_CONFIG.launchOffer.monthlyPrice,
        ...partial.launchOffer?.monthlyPrice,
      },
      disclosure: {
        ...DEFAULT_BILLING_CONFIG.launchOffer.disclosure,
        ...partial.launchOffer?.disclosure,
      },
    },
    planPromos: {
      monthly: { ...DEFAULT_BILLING_CONFIG.planPromos.monthly, ...partial.planPromos?.monthly },
      quarterly: { ...DEFAULT_BILLING_CONFIG.planPromos.quarterly, ...partial.planPromos?.quarterly },
      biannual: { ...DEFAULT_BILLING_CONFIG.planPromos.biannual, ...partial.planPromos?.biannual },
    },
    launchYearlyUpsell: {
      ...DEFAULT_BILLING_CONFIG.launchYearlyUpsell,
      ...partial.launchYearlyUpsell,
      message: {
        ...DEFAULT_BILLING_CONFIG.launchYearlyUpsell.message,
        ...partial.launchYearlyUpsell?.message,
      },
    },
    welcome: { ...DEFAULT_BILLING_CONFIG.welcome, ...partial.welcome },
    updatedAt: partial.updatedAt ?? new Date().toISOString(),
  };
}

export async function getBillingConfig(): Promise<BillingConfig> {
  const doc = await (await billingCollection()).findOne({ _id: BILLING_DOC_ID });
  if (!doc) return { ...DEFAULT_BILLING_CONFIG, updatedAt: new Date().toISOString() };
  const { _id: _ignore, ...rest } = doc;
  return mergeConfig(rest);
}

export async function saveBillingConfig(patch: Partial<BillingConfig>): Promise<BillingConfig> {
  const current = await getBillingConfig();
  const next = mergeConfig({ ...current, ...patch, updatedAt: new Date().toISOString() });
  await (await billingCollection()).updateOne(
    { _id: BILLING_DOC_ID },
    { $set: { ...next, _id: BILLING_DOC_ID } },
    { upsert: true },
  );
  return next;
}
