import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isPaymentCurrency } from "@/lib/payments/currency";
import { getBillingPlansForUser } from "@/lib/payments/billing/resolve";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currencyParam = searchParams.get("currency") ?? "NGN";
  const currency = isPaymentCurrency(currencyParam) ? currencyParam : "NGN";

  const session = await getSession();
  const data = await getBillingPlansForUser(session?.user.id ?? null, currency);
  return NextResponse.json(data);
}
