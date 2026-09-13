/** Active checkout currency. GHS kept only for legacy payment records in Mongo. */
export type PaymentCurrency = "NGN" | "GHS";

export const DEFAULT_CURRENCY: PaymentCurrency = "NGN";

export const SUPPORTED_CURRENCIES: PaymentCurrency[] = ["NGN"];

export const CURRENCY_META: Record<
  PaymentCurrency,
  { label: string; country: string; symbol: string }
> = {
  NGN: { label: "Naira", country: "Nigeria", symbol: "₦" },
  GHS: { label: "Cedi", country: "Ghana", symbol: "₵" },
};

export function isPaymentCurrency(value: string): value is PaymentCurrency {
  return value === "NGN" || value === "GHS";
}

export function formatMoney(amount: number, currency: PaymentCurrency): string {
  const { symbol } = CURRENCY_META[currency];
  return `${symbol}${amount.toLocaleString("en-US")}`;
}
