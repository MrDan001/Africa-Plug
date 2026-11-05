import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { adminCookieOptions, adminIsConfigured, verifyAdminPassword } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const SITE_GATE_COOKIE = "tap_site_gate";

function gateToken() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const password = process.env.ADMIN_PASSWORD;
  if (!secret || !password) return null;
  return createHmac("sha256", secret).update(`africa-plug-site-gate:${password}`).digest("hex");
}

export async function GET() {
  const expected = gateToken();
  const supplied = (await cookies()).get(SITE_GATE_COOKIE)?.value;
  const authenticated = Boolean(expected && supplied && supplied.length === expected.length && timingSafeEqual(Buffer.from(supplied), Buffer.from(expected)));
  return Response.json({ authenticated }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!adminIsConfigured()) {
    return Response.json({ error: "Website access is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET in Vercel Environment Variables." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  let password: unknown;
  try { password = (await request.json() as { password?: unknown }).password; }
  catch { return Response.json({ error: "Enter the website password." }, { status: 400, headers: { "Cache-Control": "no-store" } }); }
  if (!verifyAdminPassword(password)) {
    return Response.json({ error: "That password is incorrect. Please try again." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const token = gateToken();
  if (!token) return Response.json({ error: "Website access is not configured." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  (await cookies()).set(SITE_GATE_COOKIE, token, { ...adminCookieOptions(60 * 60 * 12), httpOnly: true });
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
