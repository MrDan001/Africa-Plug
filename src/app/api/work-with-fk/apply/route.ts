import { Resend } from "resend";
import { cmsBridge } from "@/lib/cms-bridge";
import { applicationSchema } from "@/lib/work-with-fk/application-schema";
import { verifyTurnstile } from "@/lib/work-with-fk/turnstile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Please check the form and try again." }, { status: 400 }); }

  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Please check the information you entered." }, { status: 400 });
  }
  const app = parsed.data;

  // Honeypot: bots fill the hidden field. Pretend success and store nothing.
  if (app.website) return Response.json({ ok: true });

  const verified = await verifyTurnstile(
    app.turnstileToken,
    request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  );
  if (!verified) {
    return Response.json({ error: "The security check could not be verified. Please refresh the page and try again." }, { status: 400 });
  }

  const referer = request.headers.get("referer") ?? "";
  let requestUrl: URL | null = null;
  try { requestUrl = referer ? new URL(referer) : null; } catch { requestUrl = null; }
  const utm = Object.fromEntries(
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].map((key) => [key, requestUrl?.searchParams.get(key) || ""]),
  );

  // 1. Save in the site admin first, so nothing is lost if an email is missed.
  //    Legacy keys (name, organisation, countryMarket, projectMandate) are kept so the existing admin screens still read the record.
  try {
    await cmsBridge({
      action: "cms.save",
      module: "applications",
      record: {
        title: `Work With FK application: ${app.company} (${app.fullName})`.slice(0, 240),
        slug: null,
        status: "review-required",
        data: {
          kind: "work",
          name: app.fullName,
          fullName: app.fullName,
          role: app.role,
          organisation: app.company,
          company: app.company,
          email: app.email,
          phone: app.phone || "",
          country: app.country,
          countryMarket: app.markets,
          markets: app.markets,
          dealStage: app.dealStage,
          projectMandate: app.goal,
          goal: app.goal,
          obstacle: app.obstacle,
          timeframe: app.timeframe,
          hearAbout: app.hearAbout || "",
          consentPrivacyTerms: true,
          sourcePath: requestUrl?.pathname || "/work-with-fk/apply",
          utm,
          submittedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Work With FK application could not be stored:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "We couldn’t store your application right now. Please try again shortly." }, { status: 503 });
  }

  try {
    await cmsBridge({
      action: "cms.save",
      module: "analytics",
      record: {
        title: "form_submit · /work-with-fk/apply",
        slug: null,
        status: "recorded",
        data: {
          eventName: "application_submitted",
          path: "/work-with-fk/apply",
          source: utm.utm_source || referer || "direct",
          referrer: referer,
          label: "Work With FK application",
          utm,
          recordedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Application conversion could not be recorded:", error instanceof Error ? error.message : "Unknown error");
  }

  // 2. Email the team, then 3. send the applicant's automatic reply.
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return Response.json({ ok: true, emailNotification: "not-configured" });

  const to = process.env.EMAIL_FK || "fk@theafricaplug.com";
  const rows: [string, string][] = [
    ["Full name", app.fullName],
    ["Role", app.role],
    ["Company or organisation", app.company],
    ["Email", app.email],
    ["Phone or WhatsApp", app.phone || "Not provided"],
    ["Country based in", app.country],
    ["Market or markets involved", app.markets],
    ["Where is the deal now?", app.dealStage],
    ["What are you trying to get done?", app.goal],
    ["What’s in the way?", app.obstacle],
    ["Timeframe", app.timeframe],
    ["How did you hear about The Africa Plug?", app.hearAbout || "Not provided"],
    ["Agreed to Privacy Policy and Terms", "Yes"],
  ];
  const text = rows.map(([key, value]) => `${key}:\n${value}`).join("\n\n");
  const tableRows = rows.map(([key, value]) =>
    `<tr><th align="left" style="padding:10px 12px;color:#626469;border-bottom:1px solid #dedbd4;font:600 12px Arial;vertical-align:top">${escapeHtml(key)}</th><td style="padding:10px 12px;color:#292a2c;border-bottom:1px solid #dedbd4;font:14px/1.6 Arial;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
  ).join("");
  const subject = `Work With FK application: ${app.company}`.replace(/[\r\n]+/g, " ").slice(0, 200);

  const resend = new Resend(apiKey);
  try {
    const result = await resend.emails.send({
      from,
      to: [to],
      replyTo: app.email,
      subject,
      text,
      html: `<div style="background:#f7f5f1;padding:24px;font-family:Arial,sans-serif"><div style="max-width:680px;margin:0 auto;border:1px solid #dedbd4;background:#fff;padding:22px"><p style="color:#d51f6d;font-size:11px;font-weight:700;letter-spacing:2px">THE AFRICA PLUG</p><h1 style="font-size:22px;color:#292a2c;margin:0 0 20px">Work With FK application</h1><table role="presentation" style="border-collapse:collapse;width:100%">${tableRows}</table></div></div>`,
    });
    if (result.error) console.error("Resend rejected the application email:", result.error.message);
  } catch (error) {
    console.error("Application email could not be sent:", error instanceof Error ? error.message : "Unknown error");
  }

  try {
    const reply = "Thank you for your application. The Africa Plug team will review it and be in touch if it’s a fit.";
    const result = await resend.emails.send({
      from,
      to: [app.email],
      replyTo: to,
      subject: "Thank you for your application",
      text: reply,
      html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#292a2c"><p>${escapeHtml(reply)}</p></div>`,
    });
    if (result.error) console.error("Resend rejected the applicant auto reply:", result.error.message);
  } catch (error) {
    console.error("Applicant auto reply could not be sent:", error instanceof Error ? error.message : "Unknown error");
  }

  // The application is saved, so it is accepted even if an email fails.
  return Response.json({ ok: true });
}