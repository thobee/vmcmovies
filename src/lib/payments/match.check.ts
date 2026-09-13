import { paymentMismatch } from "./match";

if (paymentMismatch({ status: "succeeded", currency: "NGN", amount: "700.00" }, { currency: "NGN", amountMinor: 70_000 })) {
  throw new Error("expected match");
}
if (paymentMismatch({ status: "failed", currency: "NGN", amount: "700.00" }, { currency: "NGN", amountMinor: 70_000 }) !== "Payment not successful") {
  throw new Error("expected not successful");
}
if (paymentMismatch({ status: "succeeded", currency: "GHS", amount: "700.00" }, { currency: "NGN", amountMinor: 70_000 }) !== "Currency mismatch") {
  throw new Error("expected currency mismatch");
}
if (paymentMismatch({ status: "succeeded", currency: "NGN", amount: "1.00" }, { currency: "NGN", amountMinor: 70_000 }) !== "Amount mismatch") {
  throw new Error("expected amount mismatch");
}

console.log("match.check ok");
