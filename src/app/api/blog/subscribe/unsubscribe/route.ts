import { createHmac, timingSafeEqual } from "node:crypto";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verify(id: string, email: string, token: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !/^[a-f0-9]{64}$/i.test(token)) return false;
  const expected = createHmac("sha256", secret).update(id + ":" + email.toLowerCase() + ":blog-unsubscribe").digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(token, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
async function findRecord(id: string) {
  const result = await cmsBridge<{ records?: CmsRecord[] }>({ action: "cms.list", module: "subscribers", status: "all", id });
  return (result.records ?? []).find((record) => record.id === id && record.data?.list === "blog") ?? null;
}
function page(message: string, form = "") {
  return new Response(
    "<!doctype html><html lang='en'><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Blog email preferences · The Africa Plug</title><body style='margin:0;background:#f8f5ef;color:#25221e;font:16px/1.6 Arial,sans-serif;padding:32px 16px'><main style='max-width:560px;margin:8vh auto;background:#fffdfa;border:1px solid #ded8cf;padding:32px'><p style='font-size:10px;font-weight:800;letter-spacing:3px;color:#b65e73'>THE BLOG · THE AFRICA PLUG</p><h1 style='font:700 30px/1.1 Georgia,serif'>Email preferences</h1><p>" + message + "</p>" + form + "<p style='margin-top:24px'><a style='color:#a64b64' href='/blog'>Return to The Blog →</a></p></main></body></html>",
    { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  );
}
export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") || "";
  const token = url.searchParams.get("token") || "";
  if (!id || !token) return page("This unsubscribe link is incomplete. Please use the link in your email.");
  try {
    const record = await findRecord(id);
    if (!record) return page("This Blog subscription could not be found. It may already have been removed.");
    const email = String(record.data?.email ?? "");
    if (!verify(id, email, token)) return page("This unsubscribe link is invalid.");
    const form = "<form method='post' action='/api/blog/subscribe/unsubscribe'><input type='hidden' name='id' value='" + id + "'><input type='hidden' name='token' value='" + token + "'><button style='border:0;background:#cb5274;color:white;padding:13px 20px;font-weight:700;cursor:pointer'>Unsubscribe from The Blog</button></form>";
    return page("You are subscribed to The Blog. Confirm below to stop new article emails.", form);
  } catch {
    return page("We could not check your preferences right now. Please try again later.");
  }
}
export async function POST(request: Request) {
  const url = new URL(request.url);
  let id = url.searchParams.get("id") || "";
  let token = url.searchParams.get("token") || "";
  try {
    const form = await request.formData();
    id = String(form.get("id") || id);
    token = String(form.get("token") || token);
    if (!id || !token) return page("This unsubscribe request is incomplete.");
    const record = await findRecord(id);
    if (!record) return page("This Blog subscription could not be found.");
    const email = String(record.data?.email ?? "");
    if (!verify(id, email, token)) return page("This unsubscribe link is invalid.");
    if (record.status !== "unsubscribed") {
      await cmsBridge({
        action: "cms.save",
        module: "subscribers",
        record: {
          id: record.id, title: record.title, slug: record.slug, status: "unsubscribed",
          data: { ...record.data, consent: false, subscriptionStatus: "unsubscribed", unsubscribedAt: new Date().toISOString() },
        },
      });
    }
    return page("You have been unsubscribed from The Blog. You will not receive further Blog article emails. Other Africa Plug email preferences are unchanged.");
  } catch (error) {
    console.error("Blog unsubscribe failed:", error instanceof Error ? error.message : "Unknown error");
    return page("We could not update your preferences right now. Please try again later.");
  }
}
