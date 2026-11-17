import Stripe from "stripe";
import { createHash, createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cmsBridge, getPublicCmsRecords } from "@/lib/cms-bridge";
import { sendClientEmail } from "@/lib/emails/send";
import { CAL_LINKS } from "@/lib/emails/links";
import { loadApplication, saveApplicationData } from "@/lib/work-with-fk/scheduler";
import { getStripe, getStripeWebhookSecret } from "@/lib/payments/stripe";
import { getSupabaseServiceRoleKey } from "@/lib/supabase-service-role";

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


  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id || "";
    if (!paymentIntentId) return NextResponse.json({ received: true, ignored: true });
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = supabaseUrl ? getSupabaseServiceRoleKey(supabaseUrl) : null;
    if (!supabaseUrl || !serviceRoleKey) return NextResponse.json({ error: "Refund processing is temporarily unavailable." }, { status: 500 });
    try {
      const database = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data: order, error: lookupError } = await database.from("store_orders")
        .select("id,stripe_session_id,customer_email,product_slugs,status")
        .eq("stripe_payment_intent_id", paymentIntentId).maybeSingle();
      if (lookupError) throw lookupError;
      let orderId = order?.id || "";
      let orderSessionId = order?.stripe_session_id || "";
      if (!orderId) {
        // Stripe does not guarantee webhook event ordering. Recover the paid Store session
        // so a refund arriving before checkout.session.completed cannot later become "paid".
        const sessions = await getStripe().checkout.sessions.list({ payment_intent: paymentIntentId, limit: 1 });
        const session = sessions.data.find((item) => item.metadata?.store === "africa-plug");
        if (!session) return NextResponse.json({ received: true, ignored: true, reason: "No matching Store order." });
        const productSlugs = (session.metadata?.product_slugs || "").split(",").filter(Boolean);
        const lineItems = await getStripe().checkout.sessions.listLineItems(session.id, { limit: 100 });
        const orderItems = lineItems.data.map((lineItem, index) => ({
          slug: productSlugs[index] || "", description: lineItem.description || "", quantity: lineItem.quantity ?? 1,
          amountTotal: lineItem.amount_total, currency: (lineItem.currency || session.currency || "gbp").toUpperCase(), priceId: lineItem.price?.id || "",
        }));
        const { data: recovered, error: recoverError } = await database.from("store_orders").upsert({
          stripe_session_id: session.id, stripe_event_id: event.id, status: "refunded",
          customer_email: session.customer_details?.email || session.customer_email || "",
          stripe_payment_intent_id: paymentIntentId,
          stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id || "",
          currency: (session.currency || "gbp").toUpperCase(), amount_total: session.amount_total ?? 0,
          tax_amount: session.total_details?.amount_tax ?? 0, product_slugs: productSlugs, order_items: orderItems,
          preorder_consent: session.metadata?.preorder_consent === "true",
          preorder_consent_text: session.metadata?.preorder_consent_text || null,
          preorder_consent_at: session.metadata?.preorder_consent_at || null,
          checkout_completed_at: new Date(session.created * 1000).toISOString(), updated_at: new Date().toISOString(),
        }, { onConflict: "stripe_session_id" }).select("id,stripe_session_id").single();
        if (recoverError) throw recoverError;
        orderId = recovered.id;
        orderSessionId = recovered.stripe_session_id;
      }
      const refundedAt = new Date().toISOString();
      const status = charge.refunded || charge.amount_refunded >= charge.amount ? "refunded" : "partially_refunded";
      const { error: updateError } = await database.from("store_orders").update({
        status,
        stripe_event_id: event.id,
        updated_at: refundedAt,
      }).eq("id", orderId);
      if (updateError) throw updateError;
      const { error: revokeError } = await database.from("store_download_links")
        .update({ expires_at: refundedAt }).eq("order_id", orderId);
      if (revokeError) throw revokeError;
      const orderSlug = `stripe-${orderSessionId}`.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 180);
      try {
        const previous = await cmsBridge<{ records?: Array<{ id: string; title: string; slug: string | null; status: string; data?: Record<string, unknown> }> }>({ action: "cms.list", module: "enquiries", slug: orderSlug });
        const existing = previous.records?.find((record) => record.slug === orderSlug);
        if (existing) await cmsBridge({ action: "cms.save", module: "enquiries", record: {
          id: existing.id, title: existing.title, slug: existing.slug, status,
          data: { ...(existing.data || {}), paymentStatus: status, refundedAt, stripeRefundEventId: event.id, stripeAmountRefunded: charge.amount_refunded },
        } });
      } catch (error) {
        console.error("Refunded Store order CMS mirror could not be updated:", error instanceof Error ? error.message : "Unknown error");
      }
      return NextResponse.json({ received: true, storeOrderRefunded: true, status });
    } catch (error) {
      console.error("Stripe Store refund could not be recorded:", error instanceof Error ? error.message : "Unknown error");
      return NextResponse.json({ error: "Store refund could not be recorded; Stripe may retry this event." }, { status: 500 });
    }
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") return NextResponse.json({ received: true, pending: true });
    if (session.metadata?.service === "fk-deal-diagnostic") {
      const applicationId = session.metadata.application_id;
      if (!applicationId || session.currency !== "gbp" || session.amount_total !== 250000) {
        console.error("Deal Diagnostic Stripe session metadata or amount did not match the expected payment.");
        return NextResponse.json({ error: "Invalid Deal Diagnostic payment details." }, { status: 400 });
      }
      try {
        const application = await loadApplication(applicationId);
        if (!application || application.status !== "approved") throw new Error("Approved Work With FK application not found.");
        await saveApplicationData(application, {
          paymentStatus: "confirmed",
          paymentPaidAt: new Date().toISOString(),
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || "",
          stripePaymentAmount: session.amount_total,
          stripePaymentCurrency: session.currency.toUpperCase(),
          paymentEmailFailure: null,
        });
      } catch (error) {
        console.error("Deal Diagnostic payment confirmation could not be saved:", error instanceof Error ? error.message : "Unknown error");
        return NextResponse.json({ error: "Payment confirmation could not be saved; Stripe may retry this event." }, { status: 500 });
      }
      const clientEmail = typeof session.customer_details?.email === "string" ? session.customer_details.email : typeof session.customer_email === "string" ? session.customer_email : "";
      if (!clientEmail) return NextResponse.json({ error: "Deal Diagnostic payment has no customer email; confirmation could not be sent." }, { status: 500 });
      const paidEmail = await sendClientEmail("dealDiagnosticPaid", clientEmail, {
        firstName: typeof session.customer_details?.name === "string" ? session.customer_details.name : "",
        bookingLink: CAL_LINKS.dealDiagnostic,
      }, { idempotencyKey: "paid-deal-diagnostic-" + session.id });
      if (paidEmail.status !== "sent") {
        console.error("Deal Diagnostic payment confirmation email failed:", paidEmail.status, paidEmail.error || "");
        return NextResponse.json({ error: "Payment was recorded but the booking email could not be sent; Stripe may retry." }, { status: 500 });
      }
      return NextResponse.json({ received: true, dealDiagnosticPaid: true });
    }
    if (session.metadata?.service === "fk-30-minute-call") {
      if (session.currency !== "gbp" || session.amount_total !== 35000) {
        console.error("30-minute call Stripe session amount or currency did not match.");
        return NextResponse.json({ error: "Invalid 30-minute call payment details." }, { status: 400 });
      }
      const clientEmail = typeof session.customer_details?.email === "string" ? session.customer_details.email : typeof session.customer_email === "string" ? session.customer_email : "";
      if (!clientEmail) return NextResponse.json({ error: "Call payment has no customer email." }, { status: 500 });
      const sent = await sendClientEmail("callPaid", clientEmail, {
        firstName: session.metadata?.customer_name || session.customer_details?.name || "",
        callBookingLink: CAL_LINKS.call,
      }, { idempotencyKey: "paid-fk-call-" + session.id });
      if (sent.status !== "sent") {
        console.error("30-minute call payment email failed:", sent.status, sent.error || "");
        return NextResponse.json({ error: "Payment confirmation email failed; Stripe may retry." }, { status: 500 });
      }
      return NextResponse.json({ received: true, callPaid: true });
    }
    const productSlugs = (session.metadata?.product_slugs || "").split(",").filter(Boolean);
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = supabaseUrl ? getSupabaseServiceRoleKey(supabaseUrl) : null;
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Store order database has no valid service-role credential for the configured Supabase project.");
      return NextResponse.json({ error: "Order persistence is temporarily unavailable." }, { status: 500 });
    }
    const database = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    let storeOrderId = "";
    try {
      const { data: existingOrder, error: existingOrderError } = await database.from("store_orders").select("status").eq("stripe_session_id", session.id).maybeSingle();
      if (existingOrderError) throw existingOrderError;
      if (existingOrder?.status === "refunded" || existingOrder?.status === "partially_refunded") {
        return NextResponse.json({ received: true, refundedOrderPreserved: true });
      }
      const lineItems = await getStripe().checkout.sessions.listLineItems(session.id, { limit: 100 });
      const orderItems = lineItems.data.map((lineItem, index) => ({
        slug: productSlugs[index] || "",
        description: lineItem.description || "",
        quantity: lineItem.quantity ?? 1,
        amountTotal: lineItem.amount_total,
        currency: (lineItem.currency || session.currency || "gbp").toUpperCase(),
        priceId: lineItem.price?.id || "",
      }));
      const { data: savedOrder, error: orderError } = await database.from("store_orders").upsert({
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
        preorder_consent: session.metadata?.preorder_consent === "true",
        preorder_consent_text: session.metadata?.preorder_consent_text || null,
        preorder_consent_at: session.metadata?.preorder_consent_at || (session.metadata?.preorder_consent === "true" ? new Date(session.created * 1000).toISOString() : null),
        checkout_completed_at: new Date(session.created * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "stripe_session_id" }).select("id").single();
      if (orderError) throw orderError;
      storeOrderId = savedOrder.id;
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
    const clientEmail = typeof session.customer_details?.email === "string" ? session.customer_details.email : typeof session.customer_email === "string" ? session.customer_email : "";
    if (clientEmail && productSlugs.length) {
      try {
        const products = await getPublicCmsRecords("products");
        for (const slug of productSlugs) {
          const product = products.find((item) => item.slug === slug);
          const title = product?.title || "your guide";
          const isPetTravel = /pet[-_]?travel[-_]?consultation/i.test(slug);
          const readyFile = typeof product?.data?.productFileReference === "string" && product.data.productFileReference.startsWith(slug + "/");
          const isReleasedGuide = !isPetTravel && product?.data?.availability === "available" && readyFile;
          let sent: Awaited<ReturnType<typeof sendClientEmail>> | undefined;
          if (isReleasedGuide && storeOrderId && serviceRoleKey) {
            const token = createHmac("sha256", serviceRoleKey).update(`${storeOrderId}:${slug}`).digest("hex");
            const { error: linkError } = await database.from("store_download_links").upsert({
              order_id: storeOrderId,
              product_slug: slug,
              customer_email: clientEmail,
              token_hash: createHash("sha256").update(token).digest("hex"),
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              released_at: new Date().toISOString(),
            }, { onConflict: "order_id,product_slug", ignoreDuplicates: true });
            if (linkError) throw linkError;
            const { data: savedLink, error: savedLinkError } = await database.from("store_download_links").select("email_sent_at").eq("order_id", storeOrderId).eq("product_slug", slug).maybeSingle();
            if (savedLinkError) throw savedLinkError;
            if (!savedLink?.email_sent_at) {
              const siteOrigin = (process.env.NEXT_PUBLIC_SITE_URL || "https://theafricaplug.com").replace(/\/+$/, "");
              sent = await sendClientEmail("guideReady", clientEmail, {
                firstName: typeof session.customer_details?.name === "string" ? session.customer_details.name : "",
                guideTitle: title,
                downloadLink: `${siteOrigin}/api/store/download/${token}`,
              }, { idempotencyKey: "tap-guide-ready-" + storeOrderId + "-" + slug });
              if (sent.status === "sent") {
                const { error: markSentError } = await database.from("store_download_links").update({ email_sent_at: new Date().toISOString(), email_last_error: null }).eq("order_id", storeOrderId).eq("product_slug", slug);
                if (markSentError) throw markSentError;
              }
            } else {
              continue;
            }
          } else {
            sent = await sendClientEmail(isPetTravel ? "petTravelPaid" : "preorderConfirmed", clientEmail, {
              firstName: typeof session.customer_details?.name === "string" ? session.customer_details.name : "",
              guideTitle: title,
              bookingLink: CAL_LINKS.petTravel,
            }, { idempotencyKey: (isPetTravel ? "paid-pet-travel-" : "paid-store-preorder-") + session.id + "-" + slug });
          }
          if (sent && sent.status !== "sent") {
            console.error("Store or Pet Travel payment email failed:", slug, sent.status, sent.error || "");
            return NextResponse.json({ error: "Payment was recorded but the customer confirmation email could not be sent; Stripe may retry." }, { status: 500 });
          }
        }
      } catch (error) {
        console.error("Store payment confirmation email failed:", error instanceof Error ? error.message : "Unknown error");
        return NextResponse.json({ error: "Payment was recorded but the customer confirmation email could not be sent; Stripe may retry." }, { status: 500 });
      }
    }
  }
  return NextResponse.json({ received: true });
}
