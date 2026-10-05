import { DEFAULT_BILLING_CONFIG } from "./defaults";
import {
  isUserEligibleForWelcomeTrial,
  isWelcomeTrialWindowActive,
  resolvePlanPrice,
} from "./resolve";

const config = {
  ...DEFAULT_BILLING_CONFIG,
  welcomeTrial: {
    ...DEFAULT_BILLING_CONFIG.welcomeTrial,
    enabled: true,
    startsAt: "2026-10-01T00:00:00.000Z",
    endsAt: "2026-11-01T00:00:00.000Z",
  },
};
const now = new Date("2026-10-04T12:00:00.000Z");

if (resolvePlanPrice(config, "monthly", "NGN").display !== 1000) throw new Error("monthly price mismatch");
if (resolvePlanPrice(config, "quarterly", "NGN").display !== 2800) throw new Error("quarterly price mismatch");
if (resolvePlanPrice(config, "biannual", "NGN").display !== 5200) throw new Error("biannual price mismatch");
if (resolvePlanPrice(config, "yearly", "NGN").display !== 9600) throw new Error("yearly price mismatch");
if (!isWelcomeTrialWindowActive(config, now)) throw new Error("trial window mismatch");
if (!isUserEligibleForWelcomeTrial(config, {
  createdAt: new Date("2026-10-02T00:00:00.000Z"),
  welcomeTrialStartedAt: null,
  premiumStatus: "none",
}, false, now)) throw new Error("trial eligibility mismatch");

console.log("billing.resolve.check ok");
