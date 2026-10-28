import crypto from "crypto";
import { verifyBachsWebhook } from "./bachs";

const secret = "whsec_test";
const timestamp = 1_800_000_000;
const body = JSON.stringify({ id: "evt_test", type: "collection.succeeded" });
const signature = crypto
  .createHmac("sha256", secret)
  .update(`${timestamp}.${body}`)
  .digest("hex");

process.env.BACHS_WEBHOOK_SECRET = secret;

const headers = new Headers({
  "x-bachs-signature-v2": `t=${timestamp},v1=${signature}`,
});

if (!verifyBachsWebhook(body, headers, timestamp)) {
  throw new Error("expected a valid Bachs signature");
}
if (verifyBachsWebhook(`${body}tampered`, headers, timestamp)) {
  throw new Error("expected a tampered payload to fail verification");
}
if (verifyBachsWebhook(body, headers, timestamp + 301)) {
  throw new Error("expected an expired Bachs signature to fail verification");
}

console.log("bachs.check ok");
