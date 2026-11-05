import { createHmac, timingSafeEqual } from "node:crypto";
import { Resend } from "resend";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verify(id: string, email: string, expiresAt: number, token: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !/^[a-f0-9]{64}$/i.test(token) || expiresAt < Date.now()) return false;
  const expected = createHmac("sha256", secret).update(id + ":" + email.toLowerCase() + ":" + expiresAt).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(token, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

function unsubscribeToken(id: string, email: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Email preference signing is not configured.");
  return createHmac("sha256", secret).update(id + ":" + email.toLowerCase() + ":blog-unsubscribe").digest("hex");
}

function origin() {
  try { return new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://theafricaplug.com").origin; }
  catch { return "https://theafricaplug.com"; }
}

function page(title: string, message: string, success = false) {
  return new Response(
    "<!doctype html><html lang='en'><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>" + title + " · The Africa Plug</title><body style='margin:0;background:#f8f5ef;color:#25221e;font:16px/1.6 Arial,sans-serif;padding:32px 16px'><main style='max-width:560px;margin:8vh auto;background:#fffdfa;border:1px solid #ded8cf;padding:32px'><p style='font-size:10px;font-weight:800;letter-spacing:3px;color:#b65e73'>THE BLOG · THE AFRICA PLUG</p><h1 style='font:700 30px/1.1 Georgia,serif'>" + title + "</h1><p>" + message + "</p><p style='margin-top:24px'><a style='color:#a64b64' href='/blog'>Return to The Blog →</a></p></main></body></html>",
    { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  );
}

async function findRecord(id: string) {
  const result = await cmsBridge<{ records?: CmsRecord[] }>({ action: "cms.list", module: "subscribers", status: "all", id });
  return (result.records ?? []).find((record) => record.id === id && record.data?.list === "blog") ?? null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") || "";
  const expires = Number(url.searchParams.get("expires"));
  const token = url.searchParams.get("token") || "";
  if (!id || !Number.isFinite(expires) || !token) return page("Confirmation link incomplete", "Please use the full confirmation link from the email we sent you.");
  try {
    const record = await findRecord(id);
    if (!record) return page("Subscription not found", "This Blog subscription could not be found. Please subscribe again from the Blog page.");
    const email = String(record.data?.email ?? "");
    if (!verify(id, email, expires, token) || Number(record.data?.confirmationExpiresAt) !== expires) {
      return page("Confirmation link expired", "This link is invalid or has expired. Please sign up again to receive a fresh confirmation email.");
    }
    if (record.status === "unsubscribed" || record.data?.consent !== true) return page("Subscription is inactive", "This email address is not currently subscribed to The Blog.");
    if (record.status !== "active") {
      const confirmedAt = new Date().toISOString();
      const save = await cmsBridge<{ record: CmsRecord }>({
        action: "cms.save",
        module: "subscribers",
        record: {
          id: record.id, title: record.title, slug: record.slug, status: "active",
          data: { ...record.data, subscriptionStatus: "active", confirmedAt, confirmationExpiresAt: 0 },
        },
      });
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.EMAIL_FROM;
      if (apiKey && from) {
        const optout = new URL("/api/blog/subscribe/unsubscribe", origin());
        optout.searchParams.set("id", record.id);
        optout.searchParams.set("token", unsubscribeToken(record.id, email));
        const resend = new Resend(apiKey);
        const sent = await resend.emails.send({
          from, to: [email], replyTo: process.env.EMAIL_CONNECT || "connect@theafricaplug.com",
          subject: "You're subscribed to The Blog",
          text: "You're subscribed. We'll email you when a new article is live.\n\nYou can unsubscribe from The Blog at any time: " + optout.toString() + "\n\nThe Africa Plug",
          html: "<div style='background:#f8f5ef;padding:28px 16px;font-family:Arial,sans-serif;color:#25221e'><div style='max-width:560px;margin:0 auto;background:#fffdfa;border:1px solid #ded8cf;padding:30px'><p style='font-size:10px;font-weight:800;letter-spacing:3px;color:#b65e73'>THE BLOG · THE AFRICA PLUG</p><h1 style='font:700 30px/1.1 Georgia,serif'>You're subscribed.</h1><p style='font-size:14px;line-height:1.7'>You're subscribed. We'll email you when a new article is live.</p><p style='font-size:12px;color:#777169;line-height:1.6'>You can unsubscribe from The Blog at any time using <a href='" + optout.toString() + "' style='color:#a64b64'>this link</a>. This subscription is separate from other Africa Plug email lists.</p></div></div>",
          headers: { "List-Unsubscribe": "<" + optout.toString() + ">", "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
        });
        if (sent.error) console.error("Blog subscription confirmation email failed:", sent.error.message);
      }
      return page("You're subscribed", "You're subscribed. We'll email you when a new article is live.", true);
    }
    return page("You're already subscribed", "You're subscribed. We'll email you when a new article is live.", true);
  } catch (error) {
    console.error("Blog subscription confirmation failed:", error instanceof Error ? error.message : "Unknown error");
    return page("Could not confirm yet", "We couldn't update your subscription right now. Please try again later.");
  }
}
