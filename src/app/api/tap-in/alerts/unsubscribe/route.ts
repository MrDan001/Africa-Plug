import { createHmac, timingSafeEqual } from "node:crypto";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function page(message: string) {
  return new Response(
    "<!doctype html><html lang='en'><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>T.A.P IN email preferences · The Africa Plug</title><body style='margin:0;background:#f7f5f1;color:#202020;font:16px/1.6 Arial,sans-serif;padding:32px 16px'><main style='max-width:560px;margin:8vh auto;background:#fff;border:1px solid #e8e3dc;padding:32px'><p style='font-size:11px;font-weight:700;letter-spacing:3px;color:#d90062'>THE AFRICA PLUG</p><h1 style='font:700 30px/1.1 Georgia,serif'>T.A.P IN email preferences</h1><p>" + message + "</p></main></body></html>",
    { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") || "";
  const token = url.searchParams.get("token") || "";
  if (!id || !/^[a-f0-9]{64}$/i.test(token)) return page("This unsubscribe link is incomplete or invalid.");
  try {
    const result = await cmsBridge<{ records?: CmsRecord[] }>({ action: "cms.list", module: "subscribers", status: "all", id });
    const record = (result.records ?? []).find((item) => item.id === id && item.data?.list === "tap-in-alerts");
    if (!record) return page("This T.A.P IN alert subscription could not be found.");
    const email = String(record.data?.email || "").trim().toLowerCase();
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret) return page("Email preferences are temporarily unavailable.");
    const expected = createHmac("sha256", secret).update(id + ":" + email).digest("hex");
    const supplied = Buffer.from(token, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    if (supplied.length !== expectedBuffer.length || !timingSafeEqual(supplied, expectedBuffer)) {
      return page("This unsubscribe link is invalid.");
    }
    if (record.status !== "unsubscribed") {
      await cmsBridge({
        action: "cms.save",
        module: "subscribers",
        record: {
          id: record.id,
          title: record.title,
          slug: record.slug,
          status: "unsubscribed",
          data: { ...record.data, consent: false, unsubscribedAt: new Date().toISOString(), subscriptionStatus: "unsubscribed" },
        },
      });
    }
    return page("You have been unsubscribed from T.A.P IN opportunity alerts.");
  } catch (error) {
    console.error("T.A.P IN alert unsubscribe failed:", error instanceof Error ? error.message : "Unknown error");
    return page("We couldn't update your email preferences. Please try again later.");
  }
}
