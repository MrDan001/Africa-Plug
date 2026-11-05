import { getPublicSiteSettings } from "@/lib/cms-bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getPublicSiteSettings();
  return Response.json(settings, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } });
}
