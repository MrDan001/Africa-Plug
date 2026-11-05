import { POST as handleStripeWebhook } from "@/app/api/store/webhook/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleStripeWebhook(request);
}
