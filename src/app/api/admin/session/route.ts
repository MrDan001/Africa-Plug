import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  adminCookieOptions,
  adminIsConfigured,
  isAdminAuthenticated,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    { authenticated: await isAdminAuthenticated() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (!adminIsConfigured()) {
    return Response.json(
      { error: "Admin login is not configured yet. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET in your deployment environment." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  let password: unknown;
  try {
    const body = await request.json() as { password?: unknown };
    password = body.password;
  } catch {
    return Response.json({ error: "Please enter your admin password." }, { status: 400 });
  }

  if (!verifyAdminPassword(password)) {
    return Response.json({ error: "The password is incorrect." }, { status: 401 });
  }

  const sessionCookie = (await cookies());
  const cookieOptions = adminCookieOptions();
  const secret = process.env.ADMIN_SESSION_SECRET!;
  const { createHmac } = await import("node:crypto");
  const token = createHmac("sha256", secret)
    .update(`africa-plug-admin:${process.env.ADMIN_PASSWORD}`)
    .digest("hex");

  sessionCookie.set(ADMIN_SESSION_COOKIE, token, cookieOptions);
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE() {
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, "", adminCookieOptions(0));
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
