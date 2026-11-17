import { createHmac } from "node:crypto";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";
import { findPublicOpportunityBySlug } from "@/lib/tap-in/opportunities";
import { sendClientEmail } from "@/lib/emails/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) return Response.json({ error: "Please sign in to the admin workspace." }, { status: 401 });
  let input: { slug?: unknown };
  try { input = await request.json() as typeof input; }
  catch { return Response.json({ error: "Choose a live opportunity." }, { status: 400 }); }
  const slug = typeof input.slug === "string" ? input.slug : "";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return Response.json({ error: "Choose a valid opportunity." }, { status: 400 });
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !process.env.RESEND_API_KEY) return Response.json({ error: "T.A.P IN email delivery is not configured." }, { status: 503 });

  try {
    const opportunity = await findPublicOpportunityBySlug(slug);
    if (!opportunity || opportunity.status !== "live") return Response.json({ error: "Only a live opportunity can be emailed." }, { status: 409 });
    const listed = await cmsBridge<{ records?: CmsRecord[] }>({ action: "cms.list", module: "subscribers", status: "all" });
    const recipients = (listed.records ?? []).filter((record) =>
      record.data?.list === "tap-in-alerts"
      && record.status === "active"
      && record.data?.consent === true
      && record.data?.lastOpportunityAlertSlug !== slug
      && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(record.data?.email || "").trim())
    );
    const origin = new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://theafricaplug.com").origin;
    const opportunityLink = new URL("/tap-in/" + encodeURIComponent(opportunity.slug), origin).toString();
    const shortSummary = String(opportunity.who_this_is_for || opportunity.description || "").slice(0, 400);
    let sentCount = 0;
    for (const record of recipients) {
      const email = String(record.data?.email || "").trim().toLowerCase();
      const token = createHmac("sha256", secret).update(record.id + ":" + email).digest("hex");
      const unsubscribe = new URL("/api/tap-in/alerts/unsubscribe", origin);
      unsubscribe.searchParams.set("id", record.id);
      unsubscribe.searchParams.set("token", token);
      const sent = await sendClientEmail("tapNewOpportunity", email, {
        opportunityName: opportunity.title,
        shortSummary,
        opportunityLink,
        unsubscribeLink: unsubscribe.toString(),
      }, { idempotencyKey: "tap-opportunity-" + slug + "-" + record.id, headers: { "List-Unsubscribe": `<${unsubscribe.toString()}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } });
      if (sent.status !== "sent") {
        console.error("T.A.P IN opportunity alert failed:", email, sent.status, sent.error || "");
        return Response.json({ error: "The alert campaign stopped after " + sentCount + " email(s). Please retry after checking email delivery.", sent: sentCount }, { status: 502 });
      }
      await cmsBridge({
        action: "cms.save",
        module: "subscribers",
        record: {
          id: record.id, title: record.title, slug: record.slug, status: record.status,
          data: { ...record.data, lastOpportunityAlertSlug: slug, lastOpportunityAlertAt: new Date().toISOString() },
        },
      });
      sentCount++;
    }
    return Response.json({ ok: true, sent: sentCount, message: "Opportunity alert sent to " + sentCount + " T.A.P IN subscriber(s)." });
  } catch (error) {
    console.error("T.A.P IN opportunity alert campaign failed:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "Could not send the T.A.P IN opportunity alert." }, { status: 503 });
  }
}
