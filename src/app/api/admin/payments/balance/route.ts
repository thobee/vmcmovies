import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Provider balance is available in the Bachs dashboard." },
    { status: 410 },
  );
}
