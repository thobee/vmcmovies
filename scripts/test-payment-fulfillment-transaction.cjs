const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

const source = ts.transpileModule(fs.readFileSync("src/lib/payments/fulfill.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

const payment = {
  reference: "vmc_test", userId: "user-1", planId: "monthly", currency: "NGN",
  amountMinor: 100_000, status: "pending", premiumActivated: false,
};
let premiumActivations = 0;
let emails = 0;
let release = Promise.resolve();

const client = {
  async withSession(callback) {
    return callback({
      async withTransaction(work) {
        let unlock;
        const previous = release;
        release = new Promise(resolve => { unlock = resolve; });
        await previous;
        try { return await work(); } finally { unlock(); }
      },
    });
  },
};

const context = {
  exports: {}, console,
  require(name) {
    if (name === "@/lib/payments/match") return { paymentMismatch: () => null };
    if (name === "@/lib/payments/plans") return { getPlanMonths: () => 1, isKnownPlanId: () => true };
    if (name === "@/lib/payments/records") return {
      findPaymentByReference: async () => ({ ...payment }),
      markPaymentFulfilled: async () => {
        payment.premiumActivated = true;
        payment.status = "success";
        return { ...payment };
      },
      markPaymentFailed: async () => { payment.status = "failed"; },
    };
    if (name === "@/lib/auth/users") return { activatePremium: async () => {
      premiumActivations += 1;
      return new Date("2026-11-09T00:00:00.000Z");
    } };
    if (name === "@/lib/db/mongodb") return { getMongoClient: async () => client };
    if (name === "@/lib/email/payment-notifications") return {
      ensurePaymentNotificationEmails: async () => { emails += 1; },
    };
    throw new Error(`Unexpected dependency: ${name}`);
  },
};
vm.runInNewContext(source, context);

(async () => {
  const verifyData = {
    reference: payment.reference, amount: "1000", currency: "NGN", status: "success",
    paid_at: "2026-10-09T00:00:00.000Z", metadata: { user_id: "user-1", plan_id: "monthly" },
  };
  const results = await Promise.all([
    context.exports.fulfillPayment(payment.reference, verifyData),
    context.exports.fulfillPayment(payment.reference, verifyData),
  ]);
  assert.equal(premiumActivations, 1, "Concurrent fulfillment must activate Premium once");
  assert.equal(payment.premiumActivated, true);
  assert.ok(results.every(result => result.ok));
  assert.equal(emails, 2, "Email delivery stays idempotent in its own persistence layer");
  console.log("Payment transaction checks passed: concurrent callback and webhook activate Premium once.");
})().catch(error => { console.error(error); process.exitCode = 1; });
