import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Withdrawals are unavailable after the Paystack migration." },
    { status: 410 },
  );
}
