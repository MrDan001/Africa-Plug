import { Resend } from "resend";
import { publicEnquirySchema } from "@/lib/validation/forms";
import { cmsBridge } from "@/lib/cms-bridge";

export type LeadKind = "contact" | "ask" | "partner" | "interest" | "work";

const labels: Record<LeadKind, string> = {
  contact: "Website contact enquiry",
  ask: "Ask The Africa Plug",
  partner: "Partner With TAP enquiry",
  interest: "T.A.P IN expression of interest",
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
  try { body = await request.json(); }
  catch { return Response.json({ error: "Please check the form and try again." }, { status: 400 }); }

  const parsed = publicEnquirySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Please check the information you entered." }, { status: 400 });
  }
  const lead = parsed.data;
  const isStoreWaitlist = kind === "contact" && lead.enquiryType === "Store waitlist";
  if (isStoreWaitlist && (body as Record<string, unknown>).waitlistEmailConsent !== "true") {
    return Response.json({ error: "Please confirm that you want an email when this product becomes available." }, { status: 400 });
  }
  if (isStoreWaitlist && (!lead.storeProductId || !lead.storeProductSlug)) {
    return Response.json({ error: "The product details are missing. Please refresh the Store page and try again." }, { status: 400 });
  }
  if (isStoreWaitlist) {
    const productResult = await cmsBridge<{ records?: { id: string; slug: string | null; title: string; status: string }[] }>({ action: "cms.list", module: "products", status: "all", id: lead.storeProductId });
    const product = productResult.records?.find((item) => item.id === lead.storeProductId && item.slug === lead.storeProductSlug && item.status === "active");
    if (!product) return Response.json({ error: "This product is no longer accepting waitlist registrations. Refresh the Store page and try again." }, { status: 409 });
  }
  if (kind === "partner" && (body as Record<string, unknown>).consent !== "true") {
    return Response.json({ error: "Please agree to the Privacy Policy and Terms." }, { status: 400 });
  }
  if (kind === "contact" && (lead.enquiryType === "Store enquiry" || lead.enquiryType === "Store waitlist") && (body as Record<string, unknown>).consent !== "true") {
    return Response.json({ error: "Please agree to the Privacy Policy and Terms." }, { status: 400 });
  }
  if (lead.website) return Response.json({ ok: true });

  const verified = await verifyTurnstile(
    lead.turnstileToken,
    request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  );
  if (!verified) {
    return Response.json({ error: "The security check could not be verified. Please refresh the page and try again." }, { status: 400 });
  }

  const referer = request.headers.get("referer") ?? "";
  const requestUrl = referer ? new URL(referer, "https://africa-plug.vercel.app") : null;
  const cmsModule = kind === "work" ? "applications" : "enquiries";
  const status = kind === "work" ? "review-required" : "new";
  const title = `${labels[kind]} — ${lead.name}`.slice(0, 240);
  try {
    await cmsBridge({
      action: "cms.save",
      module: cmsModule,
      record: {
        title,
        slug: null,
        status,
        data: {
          kind,
          enquiryType: lead.enquiryType || labels[kind],
          name: lead.name,
          email: lead.email,
          organisation: lead.organisation || "",
          phone: lead.phone || "",
          opportunityName: lead.opportunityName || "",
          ...(isStoreWaitlist ? {
            storeProductId: lead.storeProductId,
            storeProductSlug: lead.storeProductSlug,
            waitlistEmailConsent: true,
            waitlistConsentText: "Email me when this specific product is available. I can unsubscribe at any time.",
            waitlistConsentAt: new Date().toISOString(),
            waitlistStatus: "waiting",
          } : {}),
          countryMarket: lead.countryMarket || "",
          role: lead.role || "",
          projectMandate: lead.projectMandate || "",
          timeframe: lead.timeframe || "",
          budgetRange: lead.budgetRange || "",
          message: lead.message,
          sourcePath: requestUrl?.pathname || "",
          utm: {
            utm_source: requestUrl?.searchParams.get("utm_source") || "",
            utm_medium: requestUrl?.searchParams.get("utm_medium") || "",
            utm_campaign: requestUrl?.searchParams.get("utm_campaign") || "",
            utm_content: requestUrl?.searchParams.get("utm_content") || "",
            utm_term: requestUrl?.searchParams.get("utm_term") || "",
          },
          submittedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Persistent lead storage failed:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "We couldn't store your enquiry right now. Please try again shortly." }, { status: 503 });
  }

  try {
    await cmsBridge({
      action: "cms.save",
      module: "analytics",
      record: {
        title: `form_submit · ${requestUrl?.pathname || "/contact"}`,
        slug: null,
        status: "recorded",
        data: {
          eventName: kind === "work" ? "application_submitted" : kind === "partner" ? "partner_enquiry" : kind === "ask" ? "ask_submission" : kind === "interest" ? "interest_submitted" : "form_submit",
          path: requestUrl?.pathname || "/contact",
          source: requestUrl?.searchParams.get("utm_source") || referer || "direct",
          referrer: referer,
          label: labels[kind],
          utm: {
            utm_source: requestUrl?.searchParams.get("utm_source") || "",
            utm_medium: requestUrl?.searchParams.get("utm_medium") || "",
            utm_campaign: requestUrl?.searchParams.get("utm_campaign") || "",
            utm_content: requestUrl?.searchParams.get("utm_content") || "",
            utm_term: requestUrl?.searchParams.get("utm_term") || "",
          },
          recordedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Form conversion could not be recorded:", error instanceof Error ? error.message : "Unknown error");
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

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const internalFrom = process.env.EMAIL_INTERNAL_FROM || "The Africa Plug Notifications <notifications@theafricaplug.com>";
  const to = kind === "ask" ? (process.env.EMAIL_ASK || "ask@theafricaplug.com") : kind === "work" ? (process.env.EMAIL_FK || "fk@theafricaplug.com") : (process.env.EMAIL_CONNECT || "connect@theafricaplug.com");
  if (!apiKey || !from) {
    // The submission is safely persisted in the admin inbox even if email delivery isn't configured yet.
    return Response.json({ ok: true, emailNotification: "not-configured" });
  }

  const resend = new Resend(apiKey);
  try {
    const result = await resend.emails.send({
      from: internalFrom,
      to: [to],
      replyTo: lead.email,
      subject: kind === "contact" && (lead.enquiryType === "Store enquiry" || lead.enquiryType === "Store waitlist") ? `${lead.enquiryType === "Store waitlist" ? "Store waitlist" : "Store enquiry"}: ${lead.opportunityName || "Product"}` : kind === "partner" ? lead.enquiryType === "Article pitch" ? `Blog pitch: ${lead.name}` : `Partnership enquiry: ${lead.enquiryType || "Other"}` : `[${labels[kind]}] ${lead.name}`,
      text,
      html: `<div style="background:#08090c;padding:24px;font-family:Arial,sans-serif"><div style="max-width:680px;margin:0 auto;border:1px solid #2b2b31;background:#111217;padding:22px"><p style="color:#f50070;font-size:11px;font-weight:700;letter-spacing:2px">THE AFRICA PLUG</p><h1 style="font-size:22px;color:#fff;margin:0 0 20px">${escapeHtml(labels[kind])}</h1><table role="presentation" style="border-collapse:collapse;width:100%">${html}</table></div></div>`,
    });
    if (result.error) console.error("Resend rejected a website enquiry:", result.error.message);
  } catch (error) {
    console.error("Email notification could not be sent:", error instanceof Error ? error.message : "Unknown error");
  }

  const confirmationCopy: Record<LeadKind, { subject: string; message: string }> = {
    contact: { subject: "Thank you for contacting The Africa Plug", message: "Thank you for getting in touch with The Africa Plug. We have received your enquiry and our team will review it and respond where a follow-up is needed." },
    ask: { subject: "We’ve received your question", message: "Thank you for your question. The Africa Plug team has received it and will review it. We may follow up directly or consider it for research and content." },
    partner: { subject: "Thank you for your partnership enquiry", message: "Thank you for considering a partnership with The Africa Plug. We have received your details and will review the opportunity. If there is a fit, our team will be in touch." },
    interest: { subject: "We’ve received your T.A.P IN interest", message: `Thank you for your interest${lead.opportunityName ? ` in ${lead.opportunityName}` : ""}. The Africa Plug team has received your submission and will review it.` },
    work: { subject: "We’ve received your Work With FK enquiry", message: "Thank you for sharing your brief. The Africa Plug team has received it for review and will be in touch if it is a fit. This acknowledgement is not an approval or confirmation of an engagement." },
  };
  try {
    const confirmation = confirmationCopy[kind];
    const receipt = await resend.emails.send({
      from,
      to: [lead.email],
      replyTo: to,
      subject: confirmation.subject,
      text: `Hello ${lead.name},\n\n${confirmation.message}\n\nIf you need to add information, reply to this email.\n\nThe Africa Plug team`,
      html: `<div style="background:#f7f5f1;padding:24px;font-family:Arial,sans-serif"><div style="max-width:600px;margin:0 auto;border:1px solid #dedbd4;background:#fff;padding:28px"><p style="color:#d51f6d;font-size:11px;font-weight:700;letter-spacing:2px">THE AFRICA PLUG</p><h1 style="color:#292a2c;font-size:24px;margin:0 0 16px">Thank you, ${escapeHtml(lead.name)}</h1><p style="color:#4d5057;font-size:15px;line-height:1.7">${escapeHtml(confirmation.message)}</p><p style="color:#777b84;font-size:13px;line-height:1.6">If you need to add information, simply reply to this email.</p><p style="color:#292a2c;font-size:13px;margin-top:24px">The Africa Plug team</p></div></div>`,
    });
    if (receipt.error) console.error("Resend rejected a website enquiry confirmation:", receipt.error.message);
  } catch (error) {
    console.error("Website enquiry confirmation could not be sent:", error instanceof Error ? error.message : "Unknown error");
  }
  // The lead is already saved; an email failure must not discard the submission.
  return Response.json({ ok: true });
}
