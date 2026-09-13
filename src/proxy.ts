import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_GATE_COOKIE,
  adminGateQueryOk,
  adminGateToken,
  gateCookieOptions,
  getAdminGate,
  isAdminAuthPath,
} from "@/lib/admin/gate";
import { applySecurityHeaders } from "@/lib/security/headers";

function withSecurity(res: NextResponse, request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const admin = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const https =
    request.nextUrl.protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https";
  applySecurityHeaders(res.headers, { admin, https });
  return res;
}

function deny(request: NextRequest, api: boolean): NextResponse {
  const res = api
    ? NextResponse.json({ error: "Not found" }, { status: 404 })
    : NextResponse.rewrite(new URL("/404", request.url));
  return withSecurity(res, request);
}

export async function proxy(request: NextRequest) {
  const proto = request.headers.get("x-forwarded-proto");
  if (process.env.NODE_ENV === "production" && proto === "http") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  const passthrough = withSecurity(NextResponse.next(), request);
  const { pathname } = request.nextUrl;
  const gate = getAdminGate();
  if (!gate || !isAdminAuthPath(pathname)) return passthrough;

  const secret = process.env.AUTH_SECRET ?? "";
  if (secret.length < 32) return deny(request, pathname.startsWith("/api/"));

  const expected = await adminGateToken(gate, secret);
  if (request.cookies.get(ADMIN_GATE_COOKIE)?.value === expected) return passthrough;

  const g = request.nextUrl.searchParams.get("g");
  if (!(await adminGateQueryOk(g, gate, secret))) {
    return deny(request, pathname.startsWith("/api/"));
  }

  if (pathname.startsWith("/api/")) {
    passthrough.cookies.set(ADMIN_GATE_COOKIE, expected, gateCookieOptions());
    return passthrough;
  }

  const url = request.nextUrl.clone();
  url.searchParams.delete("g");
  const redirect = withSecurity(NextResponse.redirect(url), request);
  redirect.cookies.set(ADMIN_GATE_COOKIE, expected, gateCookieOptions());
  return redirect;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/|uploads/).*)",
  ],
};
