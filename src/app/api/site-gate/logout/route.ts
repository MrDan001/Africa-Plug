import { cookies } from "next/headers";
import { SITE_GATE_COOKIE } from "@/app/api/site-gate/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  (await cookies()).set(SITE_GATE_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
