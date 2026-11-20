import "server-only";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;
export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Stripe is not configured. Add STRIPE_SECRET_KEY to the deployment environment.");
  if (!stripeClient) stripeClient = new Stripe(secretKey);
  return stripeClient;
}

export function getStripeWebhookSecrets(): string[] {
  const secrets = [process.env.STRIPE_WEBHOOK_SECRET, process.env.STRIPE_WEBHOOK_SECRET_TEST]
    .filter((secret): secret is string => Boolean(secret?.trim()));
  if (!secrets.length) throw new Error("Stripe webhook is not configured. Add STRIPE_WEBHOOK_SECRET and, when using Stripe test mode on this endpoint, STRIPE_WEBHOOK_SECRET_TEST.");
  return [...new Set(secrets)];
}

export function getStripeWebhookSecret(): string {
  return getStripeWebhookSecrets()[0]!;
}

export function getPublicSiteUrl(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  const origin = configured || new URL(request.url).origin;
  return origin.replace(/\/$/, "");
}
