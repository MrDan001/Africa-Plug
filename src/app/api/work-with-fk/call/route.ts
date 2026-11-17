import { Resend } from "resend";
import { cmsBridge } from "@/lib/cms-bridge";
import { callSchema } from "@/lib/work-with-fk/application-schema";
import { verifyTurnstile } from "@/lib/work-with-fk/turnstile";
import { getPublicSiteUrl, getStripe } from "@/lib/payments/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Please check the form and try again." }, { status: 400 }); }
  const parsed = callSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Please check the information you entered." }, { status: 400 });
  const call = parsed.data;
  if (call.website) return Response.json({ ok: true });
  const verified = await verifyTurnstile(call.turnstileToken, request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null);
  if (!verified) return Response.json({ error: "The security check could not be verified. Please refresh the page and try again." }, { status: 400 });

  try {
    await cmsBridge({
      action: "cms.save", module: "enquiries",
      record: {
        title: `Call request: ${call.fullName}`.slice(0, 240), slug: null, status: "new",
        data: { kind: "call", enquiryType: "30 minute call with FK", name: call.fullName, email: call.email, country: call.country, message: call.question, question: call.question, consentPrivacyTerms: true, sessionCancellationConsent: true, sessionCancellationConsentText: "If my session takes place within 14 days of booking, I ask for it to go ahead and understand that I lose my right to cancel once it has taken place.", paymentStatus: "pending", submittedAt: new Date().toISOString() },
      },
    });
    const origin = getPublicSiteUrl(request);
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: call.email,
      line_items: [{ quantity: 1, price_data: { currency: "gbp", unit_amount: 35000, product_data: { name: "30 minute call with FK", description: "A focused 30-minute video consultation with FK." } } }],
      billing_address_collection: "required",
      client_reference_id: crypto.randomUUID(),
      metadata: { service: "fk-30-minute-call", customer_name: call.fullName, customer_country: call.country, session_consent: "true", session_consent_text: "If my session takes place within 14 days of booking, I ask for it to go ahead and understand that I lose my right to cancel once it has taken place." },
      success_url: `${origin}/work-with-fk/call/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/work-with-fk/call?payment=cancelled`,
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    const apiKey = process.env.RESEND_API_KEY;
    const internalFrom = process.env.EMAIL_INTERNAL_FROM || "The Africa Plug Notifications <notifications@theafricaplug.com>";
    if (apiKey) {
      try {
        await new Resend(apiKey).emails.send({
          from: internalFrom, to: [process.env.EMAIL_CONNECT || "connect@theafricaplug.com"], replyTo: call.email,
          subject: `Call request: ${call.fullName}`,
          text: `Name: ${call.fullName}\nEmail: ${call.email}\nCountry: ${call.country}\nQuestion: ${call.question}\nStripe checkout session: ${session.id}`,
        });
      } catch (error) { console.error("Call request notification failed:", error instanceof Error ? error.message : "Unknown error"); }
    }
    return Response.json({ ok: true, paymentUrl: session.url });
  } catch (error) {
    console.error("Call checkout could not be created:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "We couldn't start secure payment. Please try again shortly." }, { status: 503 });
  }
}
