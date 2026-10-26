import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const COOKIE = "tap_site_gate";

function expectedGateToken() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!password || !secret) return null;
  return createHmac("sha256", secret).update(`africa-plug-site-gate:${password}`).digest("hex");
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (
    pathname === "/site-access" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/opengraph-image" ||
    /\.[a-zA-Z0-9]{2,8}$/.test(pathname)
  ) return NextResponse.next();

  const expected = expectedGateToken();
  const supplied = request.cookies.get(COOKIE)?.value;
  const authenticated = Boolean(expected && supplied && supplied.length === expected.length && timingSafeEqual(Buffer.from(supplied), Buffer.from(expected)));
  if (authenticated) {
    // Treat the gate token as a one-page pass: consume it as soon as a
    // protected page is served, so every subsequent page navigation asks
    // for the password again.
    const response = NextResponse.next();
    response.cookies.set(COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });
    return response;
  }

  const url = request.nextUrl.clone();
  url.pathname = "/site-access";
  url.search = "";
  url.searchParams.set("next", pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
