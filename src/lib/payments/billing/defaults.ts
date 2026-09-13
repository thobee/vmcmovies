import type { BillingConfig } from "./types";

export const BILLING_DOC_ID = "default";

const zeroGhs = { NGN: 0, GHS: 0 };

export const DEFAULT_BILLING_CONFIG: BillingConfig = {
  plans: {
    monthly: { NGN: 1_000, GHS: 0 },
    quarterly: { NGN: 2_500, GHS: 0 },
    biannual: { NGN: 4_500, GHS: 0 },
  },
  launchOffer: {
    enabled: true,
    endsAt: null,
    bannerTitle: "VMC Launch Offer",
    bannerBody: "Join VMC for just ₦700 for your first month.",
    monthlyPrice: { NGN: 700, GHS: 0 },
    disclosure: {
      NGN:
        "First month ₦700 (launch offer). After that, access continues at ₦1,000/month — or save with 3-month / 6-month plans.",
      GHS: "",
    },
  },
  planPromos: {
    monthly: { enabled: false, endsAt: null, prices: zeroGhs, label: "" },
    quarterly: { enabled: false, endsAt: null, prices: zeroGhs, label: "" },
    biannual: { enabled: false, endsAt: null, prices: zeroGhs, label: "" },
  },
  launchYearlyUpsell: {
    enabled: true,
    message: {
      NGN: "You started at ₦700 — lock in ₦4,500 for 6 months before your first month ends.",
      GHS: "",
    },
  },
  welcome: {
    enabled: true,
    title: "Welcome to VMC Premium",
    intro: "You're in. Here's how to get the most from your first month.",
    watchFirstLabel: "Browse movies",
    watchFirstHref: "/movies",
    downloadSteps:
      "Open any movie or series → tap Download → Telegram opens and the bot sends your file. Make sure your Telegram username is saved on this account.",
  },
  updatedAt: new Date(0).toISOString(),
};
