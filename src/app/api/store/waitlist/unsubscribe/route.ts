import { createHmac, timingSafeEqual } from "node:crypto";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validToken(id: string, token: string, email: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !/^[a-f0-9]{64}$/i.test(token)) return false;
  const expected = createHmac("sha256", secret).update(id + ":" + email.toLowerCase()).digest("hex");
  const supplied = Buffer.from(token, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return supplied.length === expectedBuffer.length && timingSafeEqual(supplied, expectedBuffer);
}

async function findRecord(id: string) {
  const result = await cmsBridge<{ records?: CmsRecord[] }>({
    action: "cms.list",
    module: "enquiries",
    status: "all",
    id,
  });
  return (result.records ?? []).find((record) => record.id === id && record.data?.enquiryType === "Store waitlist") ?? null;
}

function page(message: string, form = "") {
  return new Response(
    "<!doctype html><html lang='en'><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Store email preferences · The Africa Plug</title><body style='margin:0;background:#f7f5f1;color:#202020;font:16px/1.6 Arial,sans-serif;padding:32px 16px'><main style='max-width:560px;margin:8vh auto;background:#fff;border:1px solid #e8e3dc;padding:32px'><p style='font-size:11px;font-weight:700;letter-spacing:3px;color:#d90062'>THE AFRICA PLUG</p><h1 style='font:700 32px/1.1 Georgia,serif'>Email preferences</h1><p>" + message + "</p>" + form + "</main></body></html>",
    { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") || "";
  const token = url.searchParams.get("token") || "";
  if (!id || !token) return page("This unsubscribe link is incomplete. Please use the link in the original email.");
  try {
    const record = await findRecord(id);
    if (!record) return page("This product waitlist entry could not be found. It may already have been removed.");
    const email = String(record.data?.email ?? "");
    if (!validToken(id, token, email)) return page("This unsubscribe link is invalid or has expired.");
    if (record.data?.waitlistEmailConsent !== true) return page("You are already unsubscribed from updates about this product.");
    const form = "<form method='post' action='/api/store/waitlist/unsubscribe'><input type='hidden' name='id' value='" + id + "'><input type='hidden' name='token' value='" + token + "'><button style='border:0;background:#ed0065;color:#fff;padding:13px 20px;font-weight:700;cursor:pointer'>Unsubscribe from this product</button></form>";
    return page("You are currently signed up for updates about " + String(record.data?.opportunityName || "this product").replace(/[&<>]/g, "") + ". Confirm below to stop those emails. This will not change your general newsletter preferences.", form);
  } catch (error) {
    console.error("Waitlist unsubscribe page failed:", error instanceof Error ? error.message : "Unknown error");
    return page("We could not check your preferences right now. Please try again later.");
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  let id = url.searchParams.get("id") || "";
  let token = url.searchParams.get("token") || "";
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      id = String(form.get("id") || id);
      token = String(form.get("token") || token);
    }
    if (!id || !token) return page("This unsubscribe request is incomplete.");
    const record = await findRecord(id);
    if (!record) return page("This product waitlist entry could not be found.");
    const email = String(record.data?.email ?? "");
    if (!validToken(id, token, email)) return page("This unsubscribe link is invalid.");
    if (record.data?.waitlistEmailConsent !== true) return page("You are already unsubscribed from updates about this product.");
    await cmsBridge({
      action: "cms.save",
      module: "enquiries",
      record: {
        id: record.id,
        title: record.title,
        slug: record.slug,
        status: record.status,
        data: {
          ...record.data,
          waitlistEmailConsent: false,
          waitlistUnsubscribedAt: new Date().toISOString(),
          waitlistStatus: "unsubscribed",
        },
      },
    });
    return page("You have been unsubscribed from updates about this product. You will not receive further launch emails for this waitlist. Your general newsletter preferences are unchanged.");
  } catch (error) {
    console.error("Waitlist unsubscribe failed:", error instanceof Error ? error.message : "Unknown error");
    return page("We could not update your preferences right now. Please try again later.");
  }
}
