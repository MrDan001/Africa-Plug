// FILE PATH: src/app/api/work-with-fk/schedule/route.ts
import { Resend } from "resend";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  createSchedulerToken,
  loadApplication,
  loadBookingSettings,
  paymentConfirmed,
  recordServerEvent,
  resolveSchedulerAccess,
  saveApplicationData,
  siteOrigin,
} from "@/lib/work-with-fk/scheduler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store" };
const fail = (error: string, status: number) => Response.json({ error }, { status, headers });

/** Public: validates a private link and returns what the scheduler page needs. Never returns the applicant's email. */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  try {
    const access = await resolveSchedulerAccess(token);
    if (!access.ok) return fail(access.error, access.status);
    const settings = await loadBookingSettings();
    if (!settings.bookingUrl) return fail("The scheduler is not available yet. Please contact The Africa Plug.", 503);
    const name = typeof access.application.data?.name === "string" ? access.application.data.name.trim().split(/\s+/)[0] : "";
    return Response.json({
      name,
      bookingUrl: settings.bookingUrl,
      meetingMinutes: settings.meetingMinutes,
      booked: Boolean(access.application.data?.meetingBookedAt),
    }, { headers });
  } catch (error) {
    console.error("Scheduler lookup failed:", error instanceof Error ? error.message : "Unknown error");
    return fail("The scheduler is temporarily unavailable. Please try again shortly.", 503);
  }
}

export async function POST(request: Request) {
  let body: { token?: unknown; id?: unknown; action?: unknown; method?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return fail("Send a valid request.", 400); }

  // Public path: the applicant confirms they have booked, using their private link.
  if (body.token !== undefined) {
    if (body.action !== "booked") return fail("Unknown action.", 400);
    try {
      const access = await resolveSchedulerAccess(body.token);
      if (!access.ok) return fail(access.error, access.status);
      if (!access.application.data?.meetingBookedAt) {
        await saveApplicationData(access.application, { meetingBookedAt: new Date().toISOString() });
        await recordServerEvent("meeting_booked", "Meeting booked (applicant confirmed)");
        await notifyTeam(access.application.title);
      }
      return Response.json({ ok: true }, { headers });
    } catch (error) {
      console.error("Meeting confirmation failed:", error instanceof Error ? error.message : "Unknown error");
      return fail("We couldn't record that just now. Please try again or email the team.", 503);
    }
  }

  // Admin path.
  if (!await isAdminAuthenticated()) return fail("Please sign in to the admin workspace.", 401);
  if (typeof body.id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.id)) return fail("This application ID is not valid.", 400);
  if (body.action !== "confirm-payment" && body.action !== "send-link") return fail("Choose a scheduler action.", 400);

  try {
    const application = await loadApplication(body.id);
    if (!application) return fail("This application could not be found.", 404);
    if (application.status !== "approved") return fail("Approve the application before using the scheduler.", 409);

    if (body.action === "confirm-payment") {
      const method = body.method === "invoice" ? "invoice" : "deposit";
      await saveApplicationData(application, { paymentStatus: "confirmed", paymentMethod: method, paymentConfirmedAt: new Date().toISOString() });
      await recordServerEvent("deposit_paid", method === "invoice" ? "Invoice payment confirmed by admin" : "Deposit confirmed by admin");
      return Response.json({ ok: true, message: "Payment recorded. You can now send the private scheduler link." }, { headers });
    }

    if (!paymentConfirmed(application)) return fail("Confirm the deposit or invoice payment before sending the scheduler link.", 409);
    if (application.data?.meetingBookedAt) return fail("This applicant has already booked a meeting.", 409);
    const settings = await loadBookingSettings();
    if (!settings.bookingUrl) return fail("Add a https:// Scheduling URL in Commercial settings first.", 409);

    const version = (Number(application.data?.schedulerLinkVersion) || 0) + 1;
    const token = createSchedulerToken(application.id, version);
    if (!token) return fail("Set SCHEDULER_TOKEN_SECRET (or ADMIN_SESSION_SECRET) in the environment first.", 503);
    const link = `${siteOrigin(request)}/work-with-fk/schedule/${token}`;
    await saveApplicationData(application, { schedulerLinkVersion: version, schedulerIssuedAt: new Date().toISOString() });

    return Response.json({
      ok: true,
      link,
      emailNotification: "not-configured",
      message: "Private scheduler link created for admin reference. Client booking is handled through the paid Cal.com flow.",
    }, { headers });
  } catch (error) {
    console.error("Scheduler action failed:", error instanceof Error ? error.message : "Unknown error");
    return fail("The scheduler could not be updated. Check the CMS connection and try again.", 503);
  }
}

async function notifyTeam(applicantName: string) {
  const internalFrom = process.env.EMAIL_INTERNAL_FROM || "The Africa Plug Notifications <notifications@theafricaplug.com>";
  if (!process.env.RESEND_API_KEY) return;
  try {
    await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: internalFrom,
      to: [process.env.EMAIL_FK || "fk@theafricaplug.com"],
      subject: `[Work With FK] Meeting booked: ${applicantName}`.slice(0, 200),
      text: `${applicantName} has confirmed they booked a meeting through the private scheduler. Check the scheduling tool for the time.`,
    });
  } catch (error) {
    console.error("Booking notification failed:", error instanceof Error ? error.message : "Unknown error");
  }
}
