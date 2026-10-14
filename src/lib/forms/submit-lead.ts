import { Resend } from "resend";
import { publicEnquirySchema } from "@/lib/validation/forms";

export type LeadKind = "contact" | "ask" | "partner" | "interest" | "work";

const labels: Record<LeadKind, string> = {
  contact: "Website contact enquiry",
  ask: "Ask The Africa Plug",
  partner: "Partner With TAP enquiry",
  interest: "TAP IN expression of interest",
  work: "Work With FK application enquiry",
};

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

async function verifyTurnstile(token: string | undefined, ip: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}

export async function handleLeadSubmission(request: Request, kind: LeadKind) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Please check the form and try again." }, { status: 400 });
  }

  const parsed = publicEnquirySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Please check the information you entered." }, { status: 400 });
  }
  const lead = parsed.data;
  // Honeypot: quietly accept likely bot submissions without sending an email.
  if (lead.website) return Response.json({ ok: true });

  const verified = await verifyTurnstile(
    lead.turnstileToken,
    request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  );
  if (!verified) {
    return Response.json({ error: "The security check could not be verified. Please refresh the page and try again." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = process.env.EMAIL_CONNECT || "connect@theafricaplug.com";
  if (!apiKey || !from) {
    return Response.json({ error: "Online email delivery is not configured yet. Please email connect@theafricaplug.com directly." }, { status: 503 });
  }

  const rows = [
    ["Enquiry type", lead.enquiryType || labels[kind]],
    ["Name", lead.name],
    ["Email", lead.email],
    ["Organisation", lead.organisation || "Not provided"],
    ["Phone", lead.phone || "Not provided"],
    ["Opportunity", lead.opportunityName || "Not applicable"],
    ["Message", lead.message],
  ] as const;
  const text = rows.map(([key, value]) => `${key}:\n${value}`).join("\n\n");
  const html = rows.map(([key, value]) =>
    `<tr><th align="left" style="padding:10px 12px;color:#a5a5ad;border-bottom:1px solid #2b2b31;font:600 12px Arial;vertical-align:top">${escapeHtml(key)}</th><td style="padding:10px 12px;color:#f5f5f7;border-bottom:1px solid #2b2b31;font:14px/1.6 Arial;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
  ).join("");

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to: [to],
      replyTo: lead.email,
      subject: `[${labels[kind]}] ${lead.name}`,
      text,
      html: `<div style="background:#08090c;padding:24px;font-family:Arial,sans-serif"><div style="max-width:680px;margin:0 auto;border:1px solid #2b2b31;background:#111217;padding:22px"><p style="color:#f50070;font-size:11px;font-weight:700;letter-spacing:2px">THE AFRICA PLUG</p><h1 style="font-size:22px;color:#fff;margin:0 0 20px">${escapeHtml(labels[kind])}</h1><table role="presentation" style="border-collapse:collapse;width:100%">${html}</table></div></div>`,
    });
    if (result.error) {
      console.error("Resend rejected a website enquiry:", result.error.message);
      return Response.json({ error: "We couldn't send your enquiry just now. Please email connect@theafricaplug.com directly." }, { status: 502 });
    }
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Failed to send website enquiry:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "We couldn't send your enquiry just now. Please email connect@theafricaplug.com directly." }, { status: 502 });
  }
}
