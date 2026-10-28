export type PaymentVerifyData = {
  reference: string;
  amount: string;
  currency: string;
  status: string;
  paid_at: string | null;
  metadata?: Record<string, string>;
};

const SUCCESS_STATUSES = new Set(["success", "succeeded", "completed", "paid"]);

export function isPaymentPaid(status: string): boolean {
  return SUCCESS_STATUSES.has(status.toLowerCase());
}
