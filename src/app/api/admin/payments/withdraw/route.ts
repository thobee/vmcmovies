import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Withdrawals are managed in the Bachs dashboard." },
    { status: 410 },
  );
}
