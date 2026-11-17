import { isAdminAuthenticated } from "@/lib/admin-auth";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";
import { sendClientEmail } from "@/lib/emails/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


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
    // A decision only counts once the applicant has been emailed. Statuses set
    // without an email (older direct status updates) can still be decided here.
    const decisionEmailSent = typeof application.data?.decisionEmailSentAt === "string" && application.data.decisionEmailSentAt.length > 0;
    if ((applicationStatus === "approved" || applicationStatus === "declined") && decisionEmailSent) {
      return Response.json({ error: `This application has already been ${application.status}. Refresh the workspace before taking another action.` }, { status: 409 });
    }
    const email = typeof application.data?.email === "string" ? application.data.email.trim() : "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "This application has no valid applicant email address. Update the application before sending a decision." }, { status: 400 });
    }
    const approved = input.decision === "approved";
    const name = (typeof application.data?.fullName === "string" ? application.data.fullName : typeof application.data?.name === "string" ? application.data.name : "").trim();
    const result = await sendClientEmail(approved ? "applicationApproved" : "applicationDeclined", email, { firstName: name }, { idempotencyKey: "work-with-fk-decision-" + application.id + "-" + input.decision });
    if (result.status !== "sent") {
      return Response.json({ error: "The decision email could not be sent. No decision was recorded; please try again." }, { status: result.status === "not-configured" ? 503 : 502 });
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
