import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "tap_admin_session";

async function hasValidAdminSession(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  const supplied = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!password || !secret || !supplied) return false;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(`africa-plug-admin:${password}`),
    );
    const expected = Array.from(new Uint8Array(signature), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");

    if (supplied.length !== expected.length) return false;
    let mismatch = 0;
    for (let i = 0; i < supplied.length; i++) {
      mismatch |= supplied.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    return mismatch === 0;
  } catch {
    return false;
  }
}

function privateEntryPath() {
  const configured = process.env.ADMIN_ENTRY_PATH?.trim();
  // Fail closed if the private entry path is missing or malformed.
  if (!configured || !/^[a-zA-Z0-9_-]{24,120}$/.test(configured)) return null;
  return `/${configured}`;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const entryPath = privateEntryPath();

  if (entryPath && (pathname === entryPath || pathname.startsWith(`${entryPath}/`))) {
    const suffix = pathname.slice(entryPath.length);
    const destination = request.nextUrl.clone();
    destination.pathname = `/admin${suffix}`;
    return NextResponse.rewrite(destination);
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (await hasValidAdminSession(request)) return NextResponse.next();

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
