import { createHmac } from "node:crypto";
import { sendClientEmail } from "@/lib/emails/send";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";
import { verifyTurnstile } from "@/lib/work-with-fk/turnstile";

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
  let input: { email?: unknown; website?: unknown; turnstileToken?: unknown };
  try { input = await request.json() as typeof input; }
  catch { return Response.json({ error: "Enter a valid email address." }, { status: 400 }); }
  if (typeof input.website === "string" && input.website.trim()) return Response.json({ ok: true, message: "Please check your inbox for a confirmation email." });
  const verified = await verifyTurnstile(typeof input.turnstileToken === "string" ? input.turnstileToken : undefined, request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null);
  if (!verified) return Response.json({ error: "The security check could not be verified. Please refresh the page and try again." }, { status: 400 });
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!process.env.RESEND_API_KEY || !secret) {
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
    const sent = await sendClientEmail("blogConfirm", email, { confirmLink: confirmUrl.toString() }, { idempotencyKey: "blog-confirm-" + record.id + "-" + expiresAt });
    if (sent.status !== "sent") throw new Error(sent.error || sent.status);
    return Response.json({ ok: true, message: "Check your inbox for a confirmation email." });
  } catch (error) {
    console.error("Blog subscription could not be saved:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "We couldn't complete your subscription just now. Please try again shortly." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
