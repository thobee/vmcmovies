import { DEFAULT_BILLING_CONFIG } from "./defaults";
import { isLaunchOfferWindowActive, resolvePlanPrice } from "./resolve";

const config = DEFAULT_BILLING_CONFIG;

const launch = resolvePlanPrice(config, "monthly", "NGN", { launchEligible: true });
if (launch.display !== 700 || launch.pricingKind !== "launch") {
  throw new Error("launch price mismatch");
}

const standard = resolvePlanPrice(config, "monthly", "NGN", { launchEligible: false });
if (standard.display !== 1000) {
  throw new Error("standard monthly mismatch");
}

const quarterly = resolvePlanPrice(config, "quarterly", "NGN", { launchEligible: false });
if (quarterly.display !== 2500) {
  throw new Error("quarterly price mismatch");
}

const biannual = resolvePlanPrice(config, "biannual", "NGN", { launchEligible: false });
if (biannual.display !== 4500) {
  throw new Error("biannual price mismatch");
}

if (!isLaunchOfferWindowActive(config)) {
  throw new Error("launch should be active by default");
}

console.log("billing.resolve.check ok");
