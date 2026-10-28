import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Bank recipient lookup is managed in the Bachs dashboard." },
    { status: 410 },
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "Bank recipient lookup is managed in the Bachs dashboard." },
    { status: 410 },
  );
}
