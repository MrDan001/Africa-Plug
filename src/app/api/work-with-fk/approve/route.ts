import { isAdminAuthenticated } from "@/lib/admin-auth";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtml(input: string) {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

/** Admin-only decision. The decision email must be accepted by Resend before the status is changed. */
export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) return Response.json({ error: "Please sign in to the admin workspace." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  let input: { id?: unknown; decision?: unknown };
  try { input = await request.json() as typeof input; }
  catch { return Response.json({ error: "Choose an application and decision." }, { status: 400 }); }

  if (typeof input.id !== "string" || !/^[0-9a-f-]{36}$/i.test(input.id)) return Response.json({ error: "This application ID is not valid." }, { status: 400 });
  if (input.decision !== "approved" && input.decision !== "declined") return Response.json({ error: "Choose Approve or Decline." }, { status: 400 });

  try {
    const found = await cmsBridge<{ records?: CmsRecord[] }>({ action: "cms.list", module: "applications", status: "all", id: input.id });
    const application = found.records?.find((item) => item.id === input.id);
    if (!application) return Response.json({ error: "This application could not be found." }, { status: 404 });
    const applicationStatus = String(application.status ?? "").trim().toLowerCase();
    if (applicationStatus === "approved" || applicationStatus === "declined") {
      return Response.json({ error: `This application has already been ${application.status}. Refresh the workspace before taking another action.` }, { status: 409 });
    }
    const email = typeof application.data?.email === "string" ? application.data.email.trim() : "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "This application has no valid applicant email address. Update the application before sending a decision." }, { status: 400 });
    }
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) return Response.json({ error: "Decision email could not be sent because Resend is not configured. No decision was recorded." }, { status: 503 });

    const name = (typeof application.data?.fullName === "string" ? application.data.fullName : typeof application.data?.name === "string" ? application.data.name : "there").trim() || "there";
    const approved = input.decision === "approved";
    const subject = approved ? "Your Work With FK application has been approved | The Africa Plug" : "An update on your Work With FK application | The Africa Plug";
    const paragraph = approved
      ? "We’re pleased to let you know that your Work With FK application has been approved. The next step is to review the Deal Diagnostic payment details, which will be sent to you separately in a follow-up email. Please wait for that secure payment email before making any payment."
      : "Thank you for taking the time to submit your Work With FK application and for considering The Africa Plug. After reviewing the information provided, we’re unable to take this application forward at this time. We appreciate your interest and wish you the very best with your work.";
    const safeName = escapeHtml(name);
    const safeParagraph = escapeHtml(paragraph);
    const result = await new Resend(apiKey).emails.send({
      from,
      to: [email],
      replyTo: process.env.EMAIL_CONNECT || "connect@theafricaplug.com",
      subject,
      text: `Hello ${name},\n\n${paragraph}\n\nThe Africa Plug team`,
      html: `<div style="background:#f7f5f1;padding:28px 16px;font-family:Arial,sans-serif;color:#292a2c"><div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e8e2e5;padding:32px"><p style="color:#d51f6d;font-size:11px;font-weight:700;letter-spacing:2px">THE AFRICA PLUG</p><h1 style="font-size:24px;line-height:1.3;margin:0 0 20px">${approved ? "Your application is approved" : "An update on your application"}</h1><p style="font-size:15px;line-height:1.8">Hello ${safeName},</p><p style="font-size:15px;line-height:1.8">${safeParagraph}</p><p style="font-size:15px;line-height:1.8;margin-top:28px">The Africa Plug team</p></div></div>`,
    });
    if (result.error) {
      console.error("Work With FK decision email failed:", result.error.message);
      return Response.json({ error: "The decision email could not be sent. No decision was recorded; please try again." }, { status: 502 });
    }

    const saved = await cmsBridge<{ record: CmsRecord }>({
      action: "cms.save",
      module: "applications",
      record: {
        id: application.id,
        title: application.title,
        slug: application.slug,
        status: input.decision,
        data: {
          ...(application.data ?? {}),
          decisionEmailStatus: "sent",
          decisionEmailType: input.decision,
          decisionEmailSentAt: new Date().toISOString(),
        },
      },
    });

    return Response.json({
      ok: true,
      application: saved.record,
      message: approved
        ? "Application approved and approval email sent. You can now send the separate payment email."
        : "Application declined and decline email sent.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Work With FK decision failed:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "The decision could not be completed. Check the email and CMS connections, then try again." }, { status: 503 });
  }
}
