import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "tap_admin_session";

function hasValidAdminSession(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  const supplied = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!password || !secret || !supplied) return false;

  const expected = createHmac("sha256", secret)
    .update(`africa-plug-admin:${password}`)
    .digest("hex");

  if (supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

function privateEntryPath() {
  const configured = process.env.ADMIN_ENTRY_PATH?.trim().replace(/^\/+|\/+$/g, "");
  // Fail closed if the private entry path is missing or malformed.
  if (!configured || !/^[a-zA-Z0-9_-]{24,120}$/.test(configured)) return null;
  return `/${configured}`;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const entryPath = privateEntryPath();

  if (entryPath && (pathname === entryPath || pathname.startsWith(`${entryPath}/`))) {
    const suffix = pathname.slice(entryPath.length);
    const destination = request.nextUrl.clone();
    destination.pathname = `/admin${suffix}`;
    return NextResponse.rewrite(destination);
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (hasValidAdminSession(request)) return NextResponse.next();

    // Rewriting to a route that does not exist renders the site's branded 404 page.
    const notFound = request.nextUrl.clone();
    notFound.pathname = "/this-page-does-not-exist";
    return NextResponse.rewrite(notFound);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
