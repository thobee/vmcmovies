import { decimalToMinor } from "@/lib/payments/amount";
import { isBachsPaid } from "@/lib/payments/bachs";

/** Compare a Bachs verify payload to our pending payment row. */
export function paymentMismatch(
  data: { status: string; currency: string; amount: string },
  payment: { currency: string; amountMinor: number },
): string | null {
  if (!isBachsPaid(data.status)) return "Payment not successful";
  if (data.currency !== payment.currency) return "Currency mismatch";
  if (decimalToMinor(data.amount) !== payment.amountMinor) return "Amount mismatch";
  return null;
}
