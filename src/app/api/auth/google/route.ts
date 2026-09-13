import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { googleAuthUrl, isGoogleAuthConfigured, signGoogleState } from "@/lib/auth/google";

export async function GET(request: NextRequest) {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.json({ error: "Google sign-in is not configured" }, { status: 503 });
  }

  const mode = request.nextUrl.searchParams.get("mode") === "signup" ? "signup" : "login";
  const state = await signGoogleState(mode);
  return NextResponse.redirect(googleAuthUrl(state));
}
