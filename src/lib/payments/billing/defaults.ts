import type { BillingConfig } from "./types";

export const BILLING_DOC_ID = "default";

const zeroGhs = { NGN: 0, GHS: 0 };

export const DEFAULT_BILLING_CONFIG: BillingConfig = {
  plans: {
    monthly: { NGN: 1_000, GHS: 0 },
    quarterly: { NGN: 2_800, GHS: 0 },
    biannual: { NGN: 5_200, GHS: 0 },
    yearly: { NGN: 9_600, GHS: 0 },
  },
  welcomeTrial: {
    enabled: false,
    startsAt: null,
    endsAt: null,
    bannerTitle: "7 days of Premium on us",
    bannerBody: "New members can activate seven days of Premium from their first Premium download. No card required.",
    durationDays: 7,
  },
  planPromos: {
    monthly: { enabled: false, endsAt: null, prices: zeroGhs, label: "" },
    quarterly: { enabled: false, endsAt: null, prices: zeroGhs, label: "" },
    biannual: { enabled: false, endsAt: null, prices: zeroGhs, label: "" },
    yearly: { enabled: false, endsAt: null, prices: zeroGhs, label: "" },
  },
  welcome: {
    enabled: true,
    title: "Welcome to VMC Premium",
    intro: "You're in. Here's how to get the most from your access.",
    watchFirstLabel: "Browse movies",
    watchFirstHref: "/movies",
    downloadSteps:
      "Open any movie or series → tap Download → Telegram opens and the bot sends your file. Make sure your Telegram username is saved on this account.",
  },
  updatedAt: new Date(0).toISOString(),
};
