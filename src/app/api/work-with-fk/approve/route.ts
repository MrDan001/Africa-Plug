// FILE PATH: src/app/api/work-with-fk/approve/route.ts
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin only. Records FK's decision on a Work With FK application.
 * It changes the status and nothing else: no email is sent and nothing is charged or booked.
 * FK sends the approval or decline email herself (fees and terms, Stripe link or invoice details).
 */
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

    return Response.json({
      ok: true,
      application: result.record,
      message: input.decision === "approved"
        ? "Marked as approved. Now send your approval email with the fee and terms."
        : "Marked as declined. Now send your decline email.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Work With FK decision failed:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "The application could not be updated. Check the CMS connection and try again." }, { status: 503 });
  }
}