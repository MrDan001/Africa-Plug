import { isAdminAuthenticated } from "@/lib/admin-auth";
import { loadApplication, saveApplicationData } from "@/lib/work-with-fk/scheduler";
import { getPublicSiteUrl, getStripe } from "@/lib/payments/stripe";
import { sendClientEmail } from "@/lib/emails/send";
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
    const stripe = getStripe();
    const previousSessionId = typeof application.data?.stripeCheckoutSessionId === "string" ? application.data.stripeCheckoutSessionId : "";
    if (/^cs_(test|live)_/.test(previousSessionId)) {
      try {
        const previous = await stripe.checkout.sessions.retrieve(previousSessionId);
        if (previous.status === "open") await stripe.checkout.sessions.expire(previousSessionId);
      } catch (error) {
        console.error("Previous Deal Diagnostic checkout session could not be expired:", error instanceof Error ? error.message : "Unknown error");
      }
    }
    const session = await stripe.checkout.sessions.create({
      mode: "payment", customer_email: email,
      expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      line_items: [{ quantity: 1, price_data: { currency: "gbp", unit_amount: 250000, product_data: { name: "Deal Diagnostic with FK", description: "A 90-minute Deal Diagnostic session with FK." } } }],
      billing_address_collection: "required", client_reference_id: application.id,
      metadata: { service: "fk-deal-diagnostic", application_id: application.id },
      success_url: `${getPublicSiteUrl(request)}/work-with-fk/deal-diagnostic/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getPublicSiteUrl(request)}/work-with-fk?payment=cancelled`,
    });
    if (!session.url) return Response.json({ error: "Stripe did not return a checkout URL." }, { status: 502 });
    const now = new Date().toISOString();
    let emailNotification: "sent" | "not-configured" | "failed" = "not-configured";
    const rawName = typeof application.data?.fullName === "string" ? application.data.fullName.trim() : typeof application.data?.name === "string" ? application.data.name.trim() : "";
    const sent = await sendClientEmail("paymentLink", email, { firstName: rawName, paymentLink: session.url });
    emailNotification = sent.status;
    if (sent.status !== "sent") console.error("Deal Diagnostic payment link email was not sent:", sent.status, sent.error || "");
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
