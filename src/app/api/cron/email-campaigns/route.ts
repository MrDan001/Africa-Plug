import { processEmailCampaignQueue } from "@/lib/emails/campaign-queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorised(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

async function run(request: Request) {
  if (!authorised(request)) {
    return Response.json({ error: "Unauthorised." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const result = await processEmailCampaignQueue();
    return Response.json({ ok: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Daily email campaign queue failed:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "The email campaign queue could not be processed." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export async function GET(request: Request) { return run(request); }
export async function POST(request: Request) { return run(request); }
