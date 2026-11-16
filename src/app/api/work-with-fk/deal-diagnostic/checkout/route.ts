import { isAdminAuthenticated } from "@/lib/admin-auth";
import { loadApplication, saveApplicationData } from "@/lib/work-with-fk/scheduler";
import { getPublicSiteUrl, getStripe } from "@/lib/payments/stripe";
import { Resend } from "resend";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) return Response.json({ error: "Please sign in to the admin workspace." }, { status: 401 });
  let body: { id?: unknown; action?: unknown };
  try { body = await request.json() as typeof body; } catch { return Response.json({ error: "Choose an application." }, { status: 400 }); }
  if (typeof body.id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.id)) return Response.json({ error: "This application ID is not valid." }, { status: 400 });
  try {
    const application = await loadApplication(body.id);
    if (!application) return Response.json({ error: "Application not found." }, { status: 404 });
    if (application.status !== "approved") return Response.json({ error: "Approve the application before requesting payment." }, { status: 409 });
    if (application.data?.paymentStatus === "confirmed") return Response.json({ error: "Payment is already confirmed." }, { status: 409 });
    const email = typeof application.data?.email === "string" ? application.data.email.trim() : "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "The application has no valid client email address." }, { status: 400 });
    const session = await getStripe().checkout.sessions.create({
      mode: "payment", customer_email: email,
      line_items: [{ quantity: 1, price_data: { currency: "gbp", unit_amount: 250000, product_data: { name: "Deal Diagnostic with FK", description: "A 90-minute Deal Diagnostic session with FK." } } }],
      billing_address_collection: "required", client_reference_id: application.id,
      metadata: { service: "fk-deal-diagnostic", application_id: application.id },
      success_url: `${getPublicSiteUrl(request)}/work-with-fk/deal-diagnostic/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getPublicSiteUrl(request)}/work-with-fk?payment=cancelled`,
    });
    if (!session.url) return Response.json({ error: "Stripe did not return a checkout URL." }, { status: 502 });
    const now = new Date().toISOString();
    let emailNotification: "sent" | "not-configured" | "failed" = "not-configured";
    if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
      try {
        const rawName = typeof application.data?.name === "string" ? application.data.name.trim() : "there";
        const safeName = rawName.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" })[c] || "");
        const sent = await new Resend(process.env.RESEND_API_KEY).emails.send({
          from: process.env.EMAIL_FROM, to: [email], replyTo: process.env.EMAIL_CONNECT || "connect@theafricaplug.com",
          subject: "Your £2,500 Deal Diagnostic payment link | The Africa Plug",
          text: `Hello ${rawName},\n\nYour secure payment link for the £2,500 Deal Diagnostic is ready:\n\n${session.url}\n\nOnce payment is complete, we will guide you through the next steps.\n\nThe Africa Plug team`,
          html: `<div style="background:#f7f5f1;padding:24px;font-family:Arial,sans-serif"><div style="max-width:600px;margin:0 auto;border:1px solid #dedbd4;background:#fff;padding:28px"><p style="color:#d51f6d;font-size:11px;font-weight:700;letter-spacing:2px">THE AFRICA PLUG</p><h1 style="color:#292a2c;font-size:24px">Your Deal Diagnostic payment link</h1><p style="color:#4d5057;line-height:1.7">Hello ${safeName}, your secure payment link for the <strong>£2,500 Deal Diagnostic</strong> is ready.</p><p style="margin:28px 0"><a href="${session.url}" style="display:inline-block;background:#d51f6d;color:#fff;text-decoration:none;padding:14px 22px;font-weight:700">Pay £2,500 securely</a></p><p style="color:#777b84;font-size:13px">Once payment is complete, we will guide you through the next steps. Reply to this email if you have any questions.</p><p>The Africa Plug team</p></div></div>`,
        });
        emailNotification = sent.error ? "failed" : "sent";
        if (sent.error) console.error("Deal Diagnostic payment email was rejected:", sent.error.message);
      } catch (error) {
        emailNotification = "failed";
        console.error("Deal Diagnostic payment email failed:", error instanceof Error ? error.message : "Unknown error");
      }
    }
    await saveApplicationData(application, {
      paymentStatus: emailNotification === "sent" ? "link_sent" : "email_failed",
      paymentCheckoutUrl: session.url,
      stripeCheckoutSessionId: session.id,
      paymentLinkCreatedAt: now,
      ...(emailNotification === "sent" ? { paymentLinkSentAt: now, paymentEmailFailure: null } : { paymentEmailFailure: emailNotification === "failed" ? "Resend rejected or failed to send the email." : "Resend is not configured." }),
    });
    return Response.json({
      ok: true, url: session.url, emailNotification,
      message: emailNotification === "sent" ? "Payment link created and emailed to the applicant." : "Payment link created, but applicant email delivery needs attention.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Deal Diagnostic checkout failed:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "Could not create the payment session." }, { status: 503 });
  }
}
