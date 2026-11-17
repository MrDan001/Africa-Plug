import { NextRequest, NextResponse } from "next/server";

/**
 * The public Africa Plug website is no longer behind a site-wide password gate.
 * Admin authentication remains handled by the admin auth flow/API routes.
 */
export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  if (hostname !== "africa-plug.vercel.app") return NextResponse.next();

  const destination = request.nextUrl.clone();
  destination.protocol = "https:";
  destination.hostname = "theafricaplug.com";
  destination.port = "";
  return NextResponse.redirect(destination, 308);
}

export const config = {
  matcher: ["/:path*"],
};
