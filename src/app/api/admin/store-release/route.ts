import { createHmac, createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";
import { getSupabaseServiceRoleKey } from "@/lib/supabase-service-role";

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
      .select("id,customer_email,product_slugs,status")
      .eq("status", "paid").contains("product_slugs", [slug]);
    if (orderError) throw orderError;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    let sent = 0;
    let skipped = 0;
    const resendKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!resendKey || !from) return Response.json({ error: "Email delivery is not configured. Set RESEND_API_KEY and EMAIL_FROM before releasing." }, { status: 503 });
    const resend = new Resend(resendKey);

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
      const result = await resend.emails.send({
        from,
        to: [order.customer_email],
        subject: `Your guide is ready: ${product.title}`,
        text: `Your preorder is ready. Download ${product.title} using your private link: ${link}\n\nThis link allows up to five downloads and expires 30 days after release.`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#292a2c"><p>Your preorder is ready.</p><p><strong>${product.title}</strong> is now available.</p><p><a href="${link}" style="display:inline-block;background:#c21e67;color:#fff;padding:13px 20px;text-decoration:none">DOWNLOAD YOUR GUIDE</a></p><p>This private link allows up to five downloads and expires 30 days after release.</p><p>The Africa Plug</p></div>`,
      });
      if (result.error) {
        await db.from("store_download_links").update({ email_last_error: result.error.message }).eq("order_id", order.id).eq("product_slug", slug);
        throw new Error(result.error.message);
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
