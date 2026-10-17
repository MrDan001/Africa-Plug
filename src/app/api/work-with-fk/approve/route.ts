import { Resend } from "resend";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    if (!["review-required", "pending", "submitted", "new", "approved", "declined"].includes(application.status)) {
      return Response.json({ error: "This application is already closed or in another state." }, { status: 409 });
    }

    const result = await cmsBridge<{ record: CmsRecord }>({
      action: "cms.status",
      module: "applications",
      id: input.id,
      status: input.decision,
    });
    const data = application.data ?? {};
    const email = typeof data.email === "string" ? data.email.trim() : "";
    const name = typeof data.name === "string" ? data.name.trim() : "there";
    let emailNotification: "sent" | "not-configured" | "failed" = "not-configured";

    if (email && process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
      try {
        const isApproved = input.decision === "approved";
        const subject = isApproved ? "An update on your Work With FK application" : "An update on your Africa Plug application";
        const body = isApproved
          ? `Hello ${name},\n\nWe have reviewed your Work With FK application and approved it for the next stage.\n\nThe commercial details and next-step instructions are being confirmed. Please do not make a payment unless you receive an official fee summary and payment or invoice instructions from The Africa Plug. This email is not a meeting or payment confirmation.\n\nRegards,\nThe Africa Plug team`
          : `Hello ${name},\n\nThank you for taking the time to submit your Work With FK application. After review, we will not be progressing this application at this time.\n\nThank you for your interest in The Africa Plug.\n\nRegards,\nThe Africa Plug team`;
        const response = await new Resend(process.env.RESEND_API_KEY).emails.send({
          from: process.env.EMAIL_FROM,
          to: [email],
          subject,
          text: body,
        });
        if (!response.error) emailNotification = "sent";
        else emailNotification = "failed";
      } catch (error) {
        emailNotification = "failed";
        console.error("Work With FK decision email failed:", error instanceof Error ? error.message : "Unknown error");
      }
    }

    return Response.json({
      ok: true,
      application: result.record,
      emailNotification,
      message: input.decision === "approved" ? "Application approved for the next stage." : "Application declined.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Work With FK decision failed:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "The application could not be updated. Check the CMS connection and try again." }, { status: 503 });
  }
}
