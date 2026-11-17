import { createHmac, createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { sendClientEmail } from "@/lib/emails/send";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";
import { getSupabaseServiceRoleKey } from "@/lib/supabase-service-role";
import { getStripe } from "@/lib/payments/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "store-downloads";
const baseUrl = () => process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://theafricaplug.com";
const tokenFor = (orderId: string, slug: string, secret: string) =>
  createHmac("sha256", secret).update(`${orderId}:${slug}`).digest("hex");
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) return Response.json({ error: "Please sign in to the admin workspace." }, { status: 401 });
  let input: { slug?: string };
  try { input = await request.json() as { slug?: string }; } catch { return Response.json({ error: "Product slug is required." }, { status: 400 }); }
  const slug = typeof input.slug === "string" ? input.slug : "";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return Response.json({ error: "Choose a valid product." }, { status: 400 });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = supabaseUrl ? getSupabaseServiceRoleKey(supabaseUrl) : null;
  if (!supabaseUrl || !serviceKey) return Response.json({ error: "Private download storage is not configured." }, { status: 503 });

  try {
    const productResult = await cmsBridge<{ records?: CmsRecord[] }>({ action: "cms.list", module: "products", slug, status: "all" });
    const product = productResult.records?.find((row) => row.slug === slug);
    const fileRef = product?.data?.productFileReference;
    if (!product || typeof fileRef !== "string" || !fileRef.startsWith(slug + "/")) {
      return Response.json({ error: "Upload the protected guide file before releasing this product." }, { status: 400 });
    }

    const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: orders, error: orderError } = await db.from("store_orders")
      .select("id,customer_email,product_slugs,status,stripe_session_id")
      .eq("status", "paid").contains("product_slugs", [slug]);
    if (orderError) throw orderError;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    let sent = 0;
    let skipped = 0;
    if (!process.env.RESEND_API_KEY) return Response.json({ error: "Email delivery is not configured. Set RESEND_API_KEY before releasing." }, { status: 503 });

    for (const order of orders ?? []) {
      if (!order.customer_email) { skipped++; continue; }
      const token = tokenFor(order.id, slug, serviceKey);
      const { error: linkError } = await db.from("store_download_links").upsert({
        order_id: order.id,
        product_slug: slug,
        customer_email: order.customer_email,
        token_hash: hashToken(token),
        expires_at: expiresAt,
        released_at: now.toISOString(),
      }, { onConflict: "order_id,product_slug", ignoreDuplicates: true });
      if (linkError) throw linkError;
      const { data: savedLink, error: readLinkError } = await db.from("store_download_links")
        .select("email_sent_at")
        .eq("order_id", order.id)
        .eq("product_slug", slug)
        .maybeSingle();
      if (readLinkError) throw readLinkError;
      if (savedLink?.email_sent_at) { skipped++; continue; }
      const link = `${baseUrl()}/api/store/download/${token}`;
      let firstName = "";
      if (typeof order.stripe_session_id === "string") {
        try {
          const session = await getStripe().checkout.sessions.retrieve(order.stripe_session_id);
          const fullName = typeof session.customer_details?.name === "string" ? session.customer_details.name.trim() : "";
          firstName = fullName.split(/\\s+/)[0] || "";
        } catch (error) {
          console.error("Could not retrieve Store customer name for guide email:", error instanceof Error ? error.message : "Unknown error");
        }
      }
      const result = await sendClientEmail("guideReady", order.customer_email, {
        firstName,
        guideTitle: product.title,
        downloadLink: link,
      }, { idempotencyKey: "tap-guide-ready-" + order.id + "-" + slug });
      if (result.status !== "sent") {
        const message = result.error || result.status;
        await db.from("store_download_links").update({ email_last_error: message }).eq("order_id", order.id).eq("product_slug", slug);
        throw new Error(message);
      }
      const { error: markSentError } = await db.from("store_download_links").update({ email_sent_at: new Date().toISOString(), email_last_error: null }).eq("order_id", order.id).eq("product_slug", slug);
      if (markSentError) throw markSentError;
      sent++;
    }

    await cmsBridge({ action: "cms.save", module: "products", record: {
      id: product.id, title: product.title, slug: product.slug, status: product.status,
      data: { ...product.data, availability: "available", releasedAt: now.toISOString() },
    } });
    return Response.json({ ok: true, released: true, emailed: sent, skipped, expiresAt });
  } catch (error) {
    console.error("Store guide release failed:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "The guide could not be released and preorder emails could not all be confirmed." }, { status: 503 });
  }
}
