import { NextResponse } from "next/server";
import { cmsBridge } from "@/lib/cms-bridge";
import { getStripe } from "@/lib/payments/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const sessionId = query.get("session_id") ?? "";
  const slug = query.get("slug") ?? "";

  if (!/^cs_(test|live)_[A-Za-z0-9_]+$/.test(sessionId) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json({ error: "This download link is invalid." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const purchasedSlugs = (session.metadata?.product_slugs ?? "").split(",").filter(Boolean);
    if (session.payment_status !== "paid" || session.metadata?.store !== "africa-plug" || !purchasedSlugs.includes(slug)) {
      return NextResponse.json({ error: "A confirmed purchase for this product is required." }, { status: 403, headers: { "Cache-Control": "no-store" } });
    }

    const result = await cmsBridge<{ url?: string }>({
      action: "store.createSignedDownload",
      module: "products",
      slug,
    });
    if (!result.url) {
      return NextResponse.json({ error: "The protected download is not available yet. Please contact The Africa Plug for help." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }

    return NextResponse.redirect(result.url, {
      status: 302,
      headers: { "Cache-Control": "no-store, max-age=0", "Referrer-Policy": "no-referrer" },
    });
  } catch (error) {
    console.error("Protected Store download could not be issued:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "We could not verify this download. Please try again or contact The Africa Plug." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
