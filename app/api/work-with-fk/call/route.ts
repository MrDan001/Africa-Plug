// FILE PATH: src/app/api/work-with-fk/call/route.ts
import { Resend } from "resend";
import { cmsBridge } from "@/lib/cms-bridge";
import { callSchema } from "@/lib/work-with-fk/application-schema";
import { verifyTurnstile } from "@/lib/work-with-fk/turnstile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

/** The £350 Stripe Payment Link lives in STRIPE_CALL_PAYMENT_LINK (server only), so it is never in the page source. */
function paymentUrl(email: string) {
  const link = process.env.STRIPE_CALL_PAYMENT_LINK?.trim();
  if (!link) return null;
  try {
    const url = new URL(link);
    if (url.protocol !== "https:" || !/(^|\.)stripe\.com$/.test(url.hostname)) return null;
    url.searchParams.set("prefilled_email", email);
    return url.toString();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Please check the form and try again." }, { status: 400 }); }

  const parsed = callSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Please check the information you entered." }, { status: 400 });
  }
  const call = parsed.data;

  // Honeypot: bots fill the hidden field. Pretend success and store nothing.
  if (call.website) return Response.json({ ok: true });

  const verified = await verifyTurnstile(
    call.turnstileToken,
    request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  );
  if (!verified) {
    return Response.json({ error: "The security check could not be verified. Please refresh the page and try again." }, { status: 400 });
  }

  // 1. Save in the site admin first, so nothing is lost if an email is missed.
  try {
    await cmsBridge({
      action: "cms.save",
      module: "enquiries",
      record: {
        title: `Call request: ${call.fullName}`.slice(0, 240),
        slug: null,
        status: "new",
        data: {
          kind: "call",
          enquiryType: "30 minute call with FK",
          name: call.fullName,
          email: call.email,
          country: call.country,
          message: call.question,
          question: call.question,
          consentPrivacyTerms: true,
          paymentStatus: "not confirmed: check Stripe before the call",
          submittedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Call request could not be stored:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "We couldn’t store your request right now. Please try again shortly." }, { status: 503 });
  }

  const redirectTo = paymentUrl(call.email);

  // 2. Email the team, then 3. send the automatic reply.
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const internalFrom = process.env.EMAIL_INTERNAL_FROM || "The Africa Plug Notifications <notifications@theafricaplug.com>";
  if (apiKey && from) {
    const to = process.env.EMAIL_CONNECT || "connect@theafricaplug.com";
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://africa-plug.vercel.app").replace(/\/+$/, "");
    const refundsUrl = `${siteUrl}/refunds`;
    const rows: [string, string][] = [
      ["Full name", call.fullName],
      ["Email", call.email],
      ["Country based in", call.country],
      ["Question", call.question],
      ["Agreed to Privacy Policy and Terms", "Yes"],
    ];
    const text = rows.map(([key, value]) => `${key}:\n${value}`).join("\n\n");
    const tableRows = rows.map(([key, value]) =>
      `<tr><th align="left" style="padding:10px 12px;color:#626469;border-bottom:1px solid #dedbd4;font:600 12px Arial;vertical-align:top">${escapeHtml(key)}</th><td style="padding:10px 12px;color:#292a2c;border-bottom:1px solid #dedbd4;font:14px/1.6 Arial;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
    ).join("");

    const resend = new Resend(apiKey);
    try {
      const result = await resend.emails.send({
        from: internalFrom,
        to: [to],
        replyTo: call.email,
        subject: `Call request: ${call.fullName}`.replace(/[\r\n]+/g, " ").slice(0, 200),
        text,
        html: `<div style="background:#f7f5f1;padding:24px;font-family:Arial,sans-serif"><div style="max-width:680px;margin:0 auto;border:1px solid #dedbd4;background:#fff;padding:22px"><p style="color:#d51f6d;font-size:11px;font-weight:700;letter-spacing:2px">THE AFRICA PLUG</p><h1 style="font-size:22px;color:#292a2c;margin:0 0 20px">30 minute call request</h1><table role="presentation" style="border-collapse:collapse;width:100%">${tableRows}</table></div></div>`,
      });
      if (result.error) console.error("Resend rejected the call request email:", result.error.message);
    } catch (error) {
      console.error("Call request email could not be sent:", error instanceof Error ? error.message : "Unknown error");
    }

    try {
      const intro = "Thank you for your question. Once payment is complete, you’ll choose your time on FK’s booking page. FK will have read your question before the call, and your £350 can be credited against a Deal Diagnostic within 30 days. You can reschedule once, free of charge, with at least 48 hours’ notice. Missed sessions can’t be refunded or rescheduled.";
      const result = await resend.emails.send({
        from,
        to: [call.email],
        replyTo: to,
        subject: "Your 30 minute call with FK",
        text: `${intro} Full terms: Refunds Policy (${refundsUrl}).`,
        html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#292a2c"><p>${escapeHtml(intro)} Full terms: <a href="${escapeHtml(refundsUrl)}" style="color:#d51f6d">Refunds Policy</a>.</p></div>`,
      });
      if (result.error) console.error("Resend rejected the call auto reply:", result.error.message);
    } catch (error) {
      console.error("Call auto reply could not be sent:", error instanceof Error ? error.message : "Unknown error");
    }
  }

  // The request is saved, so it is accepted even if an email fails.
  return Response.json({ ok: true, paymentUrl: redirectTo });
}