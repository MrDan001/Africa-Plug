import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { cmsBridge, getPublicCmsRecords } from "@/lib/cms-bridge";
import { getStripe, getPublicSiteUrl } from "@/lib/payments/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PET_TRAVEL_SLUG = "pet-travel-consultation";

async function verifyTurnstile(token: string, ip: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body, cache: "no-store",
    });
    return (await response.json() as { success?: boolean }).success === true;
  } catch { return false; }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid body");
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
  if (body.website) return NextResponse.json({ ok: true, checkoutUrl: null });
  if (name.length < 2 || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || phone.length > 50 || message.length < 10 || message.length > 5000) {
    return NextResponse.json({ error: "Please complete your name, a valid email address and your travel details." }, { status: 400 });
  }
  if (body.storeProductSlug !== PET_TRAVEL_SLUG || body.consent !== "true") {
    return NextResponse.json({ error: "Please confirm the terms and refresh the Pet Travel Consultation page." }, { status: 400 });
  }
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  if (!await verifyTurnstile(token, ip)) {
    return NextResponse.json({ error: "The security check could not be verified. Please refresh the page and try again." }, { status: 400 });
  }

  try {
    const products = await getPublicCmsRecords("products");
    const product = products.find((item) => item.slug === PET_TRAVEL_SLUG && item.status === "active");
    const data = product?.data ?? {};
    const price = Number(data.price);
    const currency = typeof data.currency === "string" ? data.currency.toLowerCase() : "gbp";
    if (!product || !Number.isSafeInteger(Math.round(price * 100)) || price <= 0 || !/^[a-z]{3}$/.test(currency)) {
      return NextResponse.json({ error: "Pet Travel Consultation is temporarily unavailable for payment. Please contact connect@theafricaplug.com." }, { status: 503 });
    }

    const enquiryId = randomUUID();
    const enquirySlug = `pet-travel-${enquiryId}`;
    const submittedAt = new Date().toISOString();
    const siteUrl = getPublicSiteUrl(request);
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [{
        quantity: 1,
        price_data: {
          currency,
          unit_amount: Math.round(price * 100),
          product_data: { name: product.title || "Pet Travel Consultation", description: "20-minute Pet Travel Consultation with The Africa Plug" },
        },
      }],
      success_url: `${siteUrl}/store/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/store/checkout/cancel?pet_travel=1`,
      metadata: {
        service: "pet-travel-consultation",
        enquiry_id: enquiryId,
        enquiry_slug: enquirySlug,
        customer_name: name,
        customer_phone: phone.slice(0, 50),
        customer_message: message.slice(0, 500),
        product_slug: PET_TRAVEL_SLUG,
        service_consent: "true",
        service_consent_text: "I agree to the Privacy Policy and Terms and understand this is a paid consultation service.",
        service_consent_at: submittedAt,
      },
      payment_intent_data: { metadata: { service: "pet-travel-consultation", enquiry_id: enquiryId } },
    });

    await cmsBridge({
      action: "cms.save", module: "enquiries",
      record: {
        title: `Pet Travel Consultation — ${name}`,
        slug: enquirySlug,
        status: "payment-pending",
        data: {
          kind: "pet_travel_consultation", enquiryType: "Pet Travel Consultation",
          name, email, phone, message, productId: product.id, productSlug: PET_TRAVEL_SLUG,
          paymentStatus: "pending", stripeSessionId: session.id, stripeCheckoutUrl: session.url || "",
          currency: currency.toUpperCase(), amount: price, submittedAt,
        },
      },
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return NextResponse.json({ ok: true, checkoutUrl: session.url });
  } catch (error) {
    console.error("Pet Travel checkout could not be created:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "We couldn't start secure checkout. Your details have not been submitted as a paid booking. Please try again." }, { status: 503 });
  }
}
