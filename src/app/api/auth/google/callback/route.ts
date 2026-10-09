import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { fetchGoogleProfile, verifyGoogleState } from "@/lib/auth/google";
import { createSession } from "@/lib/auth/session";
import { loginOrCreateGoogleUser } from "@/lib/auth/users";

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError || !code || !state) {
    return NextResponse.redirect(`${appUrl()}/login?error=google_cancelled`);
  }

  const parsed = await verifyGoogleState(state);
  if (!parsed) {
    return NextResponse.redirect(`${appUrl()}/login?error=google_state`);
  }

  try {
    const profile = await fetchGoogleProfile(code);
    const { user, isNew } = await loginOrCreateGoogleUser(profile);
    await createSession(user._id);

    const dest = parsed.next ?? (isNew || parsed.mode === "signup" ? "/account?welcome=1" : "/account");
    return NextResponse.redirect(`${appUrl()}${dest}`);
  } catch (err) {
    console.error("[auth/google/callback]", err);
    return NextResponse.redirect(`${appUrl()}/login?error=google_failed`);
  }
}
