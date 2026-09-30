import { decimalToMinor } from "@/lib/payments/amount";
import { isPaystackPaid } from "@/lib/payments/paystack";

/** Compare a provider verify payload to our pending payment row. */
export function paymentMismatch(
  data: { status: string; currency: string; amount: string },
  payment: { currency: string; amountMinor: number },
): string | null {
  if (!isPaystackPaid(data.status)) return "Payment not successful";
  if (data.currency !== payment.currency) return "Currency mismatch";
  if (decimalToMinor(data.amount) !== payment.amountMinor) return "Amount mismatch";
  return null;
}
