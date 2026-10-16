import { getHeroImageState } from "@/lib/hero-images";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const state = await getHeroImageState();
  return Response.json(state, {
    headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
  });
}
