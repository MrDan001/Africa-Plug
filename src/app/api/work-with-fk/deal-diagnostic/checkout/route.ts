import { isAdminAuthenticated } from "@/lib/admin-auth";
import { loadApplication } from "@/lib/work-with-fk/scheduler";
import { getPublicSiteUrl, getStripe } from "@/lib/payments/stripe";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) return Response.json({ error: "Please sign in to the admin workspace." }, { status: 401 });
  let body: { id?: unknown };
  try { body = await request.json() as typeof body; } catch { return Response.json({ error: "Choose an application." }, { status: 400 }); }
  if (typeof body.id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.id)) return Response.json({ error: "This application ID is not valid." }, { status: 400 });
  try {
    const application = await loadApplication(body.id);
    if (!application) return Response.json({ error: "Application not found." }, { status: 404 });
    if (application.status !== "approved") return Response.json({ error: "Approve the application before requesting payment." }, { status: 409 });
    if (application.data?.paymentStatus === "confirmed") return Response.json({ error: "Payment is already confirmed." }, { status: 409 });
    const email = typeof application.data?.email === "string" ? application.data.email.trim() : "";
    if (!email) return Response.json({ error: "The application has no valid client email address." }, { status: 400 });
    const origin = getPublicSiteUrl(request);
    const session = await getStripe().checkout.sessions.create({
      mode: "payment", customer_email: email,
      line_items: [{ quantity: 1, price_data: { currency: "gbp", unit_amount: 250000, product_data: { name: "Deal Diagnostic with FK", description: "A 90-minute Deal Diagnostic session with FK." } } }],
      billing_address_collection: "required", client_reference_id: application.id,
      metadata: { service: "fk-deal-diagnostic", application_id: application.id },
      success_url: `${origin}/work-with-fk/deal-diagnostic/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/work-with-fk?payment=cancelled`,
    });
    if (!session.url) return Response.json({ error: "Stripe did not return a checkout URL." }, { status: 502 });
    return Response.json({ ok: true, url: session.url });
  } catch (error) {
    console.error("Deal Diagnostic checkout failed:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "Could not create the payment session." }, { status: 503 });
  }
}