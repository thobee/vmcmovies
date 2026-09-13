import { randomBytes } from "crypto";

export function generatePaymentReference(): string {
  return `vmc_${randomBytes(16).toString("hex")}`;
}
