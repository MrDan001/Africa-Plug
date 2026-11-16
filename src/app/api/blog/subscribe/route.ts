import { createHmac } from "node:crypto";
import { Resend } from "resend";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sign(id: string, email: string, expiresAt: number) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Email confirmation signing is not configured.");
  return createHmac("sha256", secret).update(id + ":" + email.toLowerCase() + ":" + expiresAt).digest("hex");
}

function siteOrigin() {
  try { return new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://theafricaplug.com").origin; }
  catch { return "https://theafricaplug.com"; }
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
  let input: { email?: unknown; website?: unknown };
  try { input = await request.json() as typeof input; }
  catch { return Response.json({ error: "Enter a valid email address." }, { status: 400 }); }
  if (typeof input.website === "string" && input.website.trim()) return Response.json({ ok: true, message: "Please check your inbox for a confirmation email." });
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!apiKey || !from || !secret) {
    return Response.json({ error: "Blog email subscriptions are temporarily unavailable. Please try again later." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const listed = await cmsBridge<{ records?: CmsRecord[] }>({ action: "cms.list", module: "subscribers", status: "all" });
    const existing = (listed.records ?? []).find((record) =>
      String(record.data?.list ?? "") === "blog"
      && String(record.data?.email ?? "").trim().toLowerCase() === email
    );
    if (existing?.status === "active" && existing.data?.consent === true) {
      return Response.json({ ok: true, message: "You're already subscribed to The Blog." });
    }

    const now = new Date();
    const expiresAt = now.getTime() + 48 * 60 * 60 * 1000;
    const recordInput = {
      ...(existing?.id ? { id: existing.id } : {}),
      title: email,
      slug: email.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 170),
      status: "pending",
      data: {
        ...(existing?.data ?? {}),
        email,
        name: "",
        list: "blog",
        source: "The Blog",
        consent: true,
        consentText: "I want to receive new Blog articles by email from The Africa Plug. I can unsubscribe at any time.",
        consentVersion: "blog-email-v1",
        consentedAt: now.toISOString(),
        subscriptionStatus: "pending",
        confirmationExpiresAt: expiresAt,
        unsubscribedAt: "",
      },
    };
    const saved = await cmsBridge<{ record: CmsRecord }>({ action: "cms.save", module: "subscribers", record: recordInput });
    const record = saved.record;
    const origin = siteOrigin();
    const token = sign(record.id, email, expiresAt);
    const confirmUrl = new URL("/api/blog/subscribe/confirm", origin);
    confirmUrl.searchParams.set("id", record.id);
    confirmUrl.searchParams.set("expires", String(expiresAt));
    confirmUrl.searchParams.set("token", token);
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to: [email],
      replyTo: process.env.EMAIL_CONNECT || "connect@theafricaplug.com",
      subject: "Confirm your subscription to The Blog",
      text: "Thanks for signing up to The Blog by The Africa Plug. Confirm your email address to receive an email when a new article is published: " + confirmUrl.toString() + "\n\nThis link expires in 48 hours. If you did not request these updates, you can ignore this email.",
      html: "<div style='background:#f8f5ef;padding:28px 16px;font-family:Arial,sans-serif;color:#25221e'><div style='max-width:560px;margin:0 auto;background:#fffdfa;border:1px solid #ded8cf;padding:30px'><p style='font-size:10px;font-weight:800;letter-spacing:3px;color:#b65e73'>THE BLOG · THE AFRICA PLUG</p><h1 style='font:700 30px/1.1 Georgia,serif'>One last step.</h1><p style='font-size:14px;line-height:1.7'>Please confirm your email address to receive new Blog articles from The Africa Plug.</p><p style='margin:26px 0'><a href='" + escapeHtml(confirmUrl.toString()) + "' style='display:inline-block;background:#cb5274;color:white;text-decoration:none;padding:14px 22px;font-size:11px;font-weight:800;letter-spacing:1px'>CONFIRM SUBSCRIPTION →</a></p><p style='font-size:12px;color:#777169;line-height:1.6'>This confirmation link expires in 48 hours. If you did not request these updates, you can ignore this email.</p></div></div>",
    });
    if (result.error) throw new Error(result.error.message);
    return Response.json({ ok: true, message: "Check your inbox for a confirmation email." });
  } catch (error) {
    console.error("Blog subscription could not be saved:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "We couldn't complete your subscription just now. Please try again shortly." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
