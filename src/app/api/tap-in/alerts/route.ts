import { createHmac } from "node:crypto";
import { sendClientEmail } from "@/lib/emails/send";
import { cmsBridge } from "@/lib/cms-bridge";
import { alertsSchema } from "@/lib/tap-in/forms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Opportunity alerts sign up. This is its own list: it never adds anyone to another list.
 * The time and page of each sign up are saved as the consent record.
 * Sending the alert emails themselves (and the unsubscribe link) is the email tool's job and is connected separately.
 */
export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return json({ error: "Enter a valid email address and try again." }, 400); }
  const parsed = alertsSchema.safeParse(body);
  if (!parsed.success) return json({ error: parsed.error.issues[0]?.message ?? "Enter a valid email address." }, 400);
  if (parsed.data.website) return json({ ok: true });

  const email = parsed.data.email.toLowerCase();
  const slug = `tap-in-alerts-${email.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`.slice(0, 170);
  const now = new Date().toISOString();

  let subscriberId = "";
  try {
    const saved = await cmsBridge<{ record: { id: string } }>({
      action: "cms.save",
      module: "subscribers",
      record: {
        title: email,
        slug,
        status: "active",
        data: { email, list: "tap-in-alerts", source: "T.A.P IN opportunity alerts", consent: true, consentAt: now, consentPage: "/tap-in", subscribedAt: now },
      },
    });
    subscriberId = saved.record.id;
  } catch (error) {
    console.error("T.A.P IN alerts sign up could not be stored:", error instanceof Error ? error.message : "Unknown error");
    return json({ error: "We couldn’t sign you up right now. Please try again shortly." }, 503);
  }

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !process.env.RESEND_API_KEY) {
    console.error("T.A.P IN alerts confirmation email is not configured.");
    return json({ ok: true, emailNotification: "not-configured" });
  }
  const token = createHmac("sha256", secret).update(subscriberId + ":" + email).digest("hex");
  const origin = new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://theafricaplug.com").origin;
  const unsubscribe = new URL("/api/tap-in/alerts/unsubscribe", origin);
  unsubscribe.searchParams.set("id", subscriberId);
  unsubscribe.searchParams.set("token", token);
  const sent = await sendClientEmail("tapAlertsSignup", email, { unsubscribeLink: unsubscribe.toString() }, { idempotencyKey: "tap-alerts-signup-" + subscriberId });
  if (sent.status !== "sent") console.error("T.A.P IN alerts confirmation email failed:", sent.status, sent.error || "");
  return json({ ok: true });
}