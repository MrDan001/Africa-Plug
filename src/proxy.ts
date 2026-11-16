import { NextRequest, NextResponse } from "next/server";

/**
 * The public Africa Plug website is no longer behind a site-wide password gate.
 * Admin authentication remains handled by the admin auth flow/API routes.
 */
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
