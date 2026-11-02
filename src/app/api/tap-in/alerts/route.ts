// FILE PATH: src/app/api/tap-in/alerts/route.ts
import { Resend } from "resend";
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

  try {
    await cmsBridge({
      action: "cms.save",
      module: "subscribers",
      record: {
        title: email,
        slug,
        status: "active",
        data: { email, list: "tap-in-alerts", source: "T.A.P IN opportunity alerts", consent: true, consentAt: now, consentPage: "/tap-in", subscribedAt: now },
      },
    });
  } catch (error) {
    console.error("T.A.P IN alerts sign up could not be stored:", error instanceof Error ? error.message : "Unknown error");
    return json({ error: "We couldn’t sign you up right now. Please try again shortly." }, 503);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (apiKey && from) {
    try {
      const text = "Thank you for signing up. We’ll email you when new business and investment opportunities are published on T.A.P IN. Listings are shared for information only and are not an offer, recommendation or endorsement.\n\nThe Africa Plug";
      const result = await new Resend(apiKey).emails.send({
        from,
        to: [email],
        subject: "You’re signed up for T.A.P IN opportunity alerts",
        text,
        html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#292a2c"><p>Thank you for signing up. We’ll email you when new business and investment opportunities are published on T.A.P IN. Listings are shared for information only and are not an offer, recommendation or endorsement.</p><p>The Africa Plug</p></div>`,
      });
      if (result.error) console.error("Resend rejected the alerts confirmation:", result.error.message);
    } catch (error) {
      console.error("Alerts confirmation email could not be sent:", error instanceof Error ? error.message : "Unknown error");
    }
  }
  return json({ ok: true });
}