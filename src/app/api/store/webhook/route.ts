import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
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
    const productSlugs = (session.metadata?.product_slugs || "").split(",").filter(Boolean);
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Store order database configuration is missing.");
      return NextResponse.json({ error: "Order persistence is temporarily unavailable." }, { status: 500 });
    }
    try {
      const database = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
      const lineItems = await getStripe().checkout.sessions.listLineItems(session.id, { limit: 100 });
      const orderItems = lineItems.data.map((lineItem, index) => ({
        slug: productSlugs[index] || "",
        description: lineItem.description || "",
        quantity: lineItem.quantity ?? 1,
        amountTotal: lineItem.amount_total,
        currency: (lineItem.currency || session.currency || "gbp").toUpperCase(),
        priceId: lineItem.price?.id || "",
      }));
      const { error: orderError } = await database.from("store_orders").upsert({
        stripe_session_id: session.id,
        stripe_event_id: event.id,
        status: "paid",
        customer_email: session.customer_details?.email || session.customer_email || "",
        stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || "",
        stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id || "",
        currency: (session.currency || "gbp").toUpperCase(),
        amount_total: session.amount_total ?? 0,
        tax_amount: session.total_details?.amount_tax ?? 0,
        product_slugs: productSlugs,
        order_items: orderItems,
        checkout_completed_at: new Date(session.created * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "stripe_session_id" });
      if (orderError) throw orderError;
    } catch (error) {
      console.error("Paid Store order could not be saved to the orders table:", error instanceof Error ? error.message : "Unknown error");
      return NextResponse.json({ error: "Order persistence failed; Stripe may retry this event." }, { status: 500 });
    }

    const orderSlug = `stripe-${session.id}`.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 180);
    try {
      const previous = await cmsBridge<{ records?: Array<{ id: string; slug: string | null }> }>({ action: "cms.list", module: "enquiries", slug: orderSlug });
      const existing = previous.records?.find((record) => record.slug === orderSlug);
      await cmsBridge({
        action: "cms.save",
        module: "enquiries",
        record: {
          ...(existing ? { id: existing.id } : {}),
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
            productSlugs,
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
