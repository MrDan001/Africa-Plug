import "server-only";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;
export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Stripe is not configured. Add STRIPE_SECRET_KEY to the deployment environment.");
  if (!stripeClient) stripeClient = new Stripe(secretKey);
  return stripeClient;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("Stripe webhook is not configured. Add STRIPE_WEBHOOK_SECRET to the deployment environment.");
  return secret;
}

export function getPublicSiteUrl(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  const origin = configured || new URL(request.url).origin;
  return origin.replace(/\/$/, "");
}
