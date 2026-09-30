import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Provider balance is unavailable after the Paystack migration." },
    { status: 410 },
  );
}
