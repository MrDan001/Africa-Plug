import { NextResponse } from "next/server";
import { z } from "zod";
import { cmsBridge, getPublicCmsRecords } from "@/lib/cms-bridge";
import { cmsRecordToPublicProduct } from "@/lib/public-cms-content";
import { getPublicSiteUrl, getStripe } from "@/lib/payments/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  items: z.array(z.object({ slug: z.string().min(1).max(180), quantity: z.number().int().min(1).max(10) })).min(1).max(30),
  email: z.string().email().max(254).optional(),
}).strict();

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Please review your basket and try again." }, { status: 400 }); }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Your basket is invalid. Please refresh the Store and try again." }, { status: 400 });

  try {
    const records = await getPublicCmsRecords("products");
    const items = await Promise.all(parsed.data.items.map(async (item) => {
      const record = records.find((candidate) => candidate.slug === item.slug);
      const product = record ? cmsRecordToPublicProduct(record) : null;
      if (!product) throw new Error("One of the products is no longer available. Please refresh the Store.");
      if (product.price <= 0) throw new Error("This product has no confirmed purchase price yet.");
      if (!Number.isSafeInteger(Math.round(product.price * 100))) throw new Error("A product price is invalid.");
      if (!/^[A-Z]{3}$/.test(product.currency)) throw new Error("A product currency is invalid.");
      // Verify a private delivery file exists before accepting payment. The short-lived
      // URL is discarded here; customers receive a fresh, session-verified link after payment.
      const delivery = await cmsBridge<{ url?: string }>({
        action: "store.createSignedDownload",
        module: "products",
        slug: product.slug,
      });
      if (!delivery.url) throw new Error("This product is not ready for secure delivery yet.");
      return { product, quantity: item.quantity };
    }));
    const currencies = new Set(items.map(({ product }) => product.currency.toLowerCase()));
    if (currencies.size !== 1) return NextResponse.json({ error: "Please check out products in the same currency together." }, { status: 400 });

    const origin = getPublicSiteUrl(request);
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: items.map(({ product, quantity }) => ({
        quantity,
        price_data: {
          currency: product.currency.toLowerCase(),
          unit_amount: Math.round(product.price * 100),
          product_data: {
            name: product.title.slice(0, 250),
            description: product.summary.slice(0, 500) || undefined,
            ...(product.imageUrl.startsWith("https://") ? { images: [product.imageUrl] } : {}),
          },
        },
      })),
      ...(parsed.data.email ? { customer_email: parsed.data.email } : {}),
      billing_address_collection: "required",
      automatic_tax: { enabled: process.env.STRIPE_TAX_ENABLED === "true" },
      allow_promotion_codes: true,
      client_reference_id: crypto.randomUUID(),
      metadata: { store: "africa-plug", product_slugs: items.map(({ product }) => product.slug).join(",").slice(0, 500) },
      success_url: `${origin}/store/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/store/checkout/cancel`,
    });
    if (!session.url) return NextResponse.json({ error: "Stripe did not return a checkout link. Please try again." }, { status: 502 });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout is temporarily unavailable.";
    const status = /no longer available|no confirmed purchase price|currency is invalid|price is invalid|protected download|secure delivery|available for delivery/i.test(message) ? 400 : /not configured/i.test(message) ? 503 : 500;
    if (status >= 500) console.error("Store checkout could not be created:", message);
    return NextResponse.json({ error: status === 500 ? "We couldn't start checkout right now. Please try again shortly." : message }, { status });
  }
}
