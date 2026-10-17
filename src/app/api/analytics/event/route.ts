import { cmsBridge } from "@/lib/cms-bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_EVENTS = new Set(["page_view", "article_view", "product_view", "listing_viewed", "tap_in_view", "form_submit", "application_started", "application_submitted", "deposit_paid", "meeting_booked", "interest_submitted", "product_purchased", "partner_enquiry", "ask_submission", "newsletter_signup", "work_with_fk_click", "cta_click"]);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return Response.json({ ok: true }, { status: 202 }); }

  const eventName = typeof body.eventName === "string" ? body.eventName : "";
  if (!ALLOWED_EVENTS.has(eventName)) return Response.json({ ok: true }, { status: 202 });
  const path = typeof body.path === "string" ? body.path.slice(0, 300) : "/";
  const query = typeof body.query === "string" ? body.query.slice(0, 1000) : "";
  const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 500) : "";
  const source = typeof body.source === "string" ? body.source.slice(0, 100) : "";
  const label = typeof body.label === "string" ? body.label.slice(0, 160) : "";
  const utm = body.utm && typeof body.utm === "object" && !Array.isArray(body.utm) ? body.utm : {};
  try {
    await cmsBridge({
      action: "cms.save",
      module: "analytics",
      record: {
        title: `${eventName} · ${path}`.slice(0, 240),
        slug: null,
        status: "recorded",
        data: { eventName, path, query, referrer, source, label, utm, recordedAt: new Date().toISOString() },
      },
    });
  } catch (error) {
    console.error("Analytics event was not stored:", error instanceof Error ? error.message : "Unknown error");
  }
  return Response.json({ ok: true }, { status: 202, headers: { "Cache-Control": "no-store" } });
}
