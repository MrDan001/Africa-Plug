import Stripe from "stripe";
import { NextResponse } from "next/server";
import { cmsBridge } from "@/lib/cms-bridge";
import { getStripe, getStripeWebhookSecret } from "@/lib/payments/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    event = getStripe().webhooks.constructEvent(rawBody, signature, getStripeWebhookSecret());
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") return NextResponse.json({ received: true, pending: true });
    const orderSlug = `stripe-${session.id}`.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 180);
    try {
      await cmsBridge({
        action: "cms.save",
        module: "enquiries",
        record: {
          title: `Store order — ${session.customer_details?.email || session.customer_email || session.id}`.slice(0, 240),
          slug: orderSlug,
          status: "paid",
          data: {
            kind: "store_order",
            provider: "stripe",
            stripeSessionId: session.id,
            stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || "",
            stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.id || "",
            customerEmail: session.customer_details?.email || session.customer_email || "",
            currency: (session.currency || "").toUpperCase(),
            amountTotal: session.amount_total,
            taxAmount: session.total_details?.amount_tax ?? 0,
            productSlugs: (session.metadata?.product_slugs || "").split(",").filter(Boolean),
            paymentStatus: session.payment_status,
            checkoutCompletedAt: new Date().toISOString(),
            stripeEventId: event.id,
          },
        },
      });
    } catch (error) {
      console.error("Paid Store order could not be saved to the CMS:", error instanceof Error ? error.message : "Unknown error");
      return NextResponse.json({ error: "Order persistence failed; Stripe may retry this event." }, { status: 500 });
    }
  }
  return NextResponse.json({ received: true });
}
