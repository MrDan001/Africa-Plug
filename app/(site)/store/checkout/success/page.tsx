import Link from "next/link";
import { createHash, createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey } from "@/lib/supabase-service-role";
import { getStripe } from "@/lib/payments/stripe";
import { getPublicCmsRecords } from "@/lib/cms-bridge";
import ClearStoreCart from "@/components/store/ClearStoreCart";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order received | The Africa Plug Store", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ session_id?: string | string[] }> };

export default async function StoreCheckoutSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : "";
  let paymentConfirmed = false;
  let purchasedSlugs: string[] = [];
  const downloadLinks = new Map<string, string>();

  if (/^cs_(test|live)_[A-Za-z0-9_]+$/.test(sessionId)) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      paymentConfirmed = session.payment_status === "paid" && session.metadata?.store === "africa-plug";
      if (paymentConfirmed) purchasedSlugs = (session.metadata?.product_slugs ?? "").split(",").filter(Boolean);
    } catch {
      // Keep the page safe if Stripe configuration or the session lookup is unavailable.
    }
  }

  const downloadProducts = paymentConfirmed && purchasedSlugs.length
    ? (await getPublicCmsRecords("products")).filter((product) => product.slug && purchasedSlugs.includes(product.slug) && product.data?.availability === "available" && typeof product.data?.productFileReference === "string" && product.data.productFileReference.startsWith(product.slug + "/"))
    : [];

  if (paymentConfirmed && downloadProducts.length && process.env.SUPABASE_URL) {
    const serviceKey = getSupabaseServiceRoleKey(process.env.SUPABASE_URL);
    if (serviceKey) {
      const db = createClient(process.env.SUPABASE_URL, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data: order } = await db.from("store_orders").select("id,customer_email").eq("stripe_session_id", sessionId).maybeSingle();
      if (order?.id) {
        for (const product of downloadProducts) {
          const slug = product.slug!;
          const token = createHmac("sha256", serviceKey).update(`${order.id}:${slug}`).digest("hex");
          await db.from("store_download_links").upsert({
            order_id: order.id, product_slug: slug, customer_email: order.customer_email || "",
            token_hash: createHash("sha256").update(token).digest("hex"),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          }, { onConflict: "order_id,product_slug", ignoreDuplicates: true });
          downloadLinks.set(slug, `/api/store/download/${token}`);
        }
      }
    }
  }

  return <main style={{maxWidth:760,margin:"0 auto",padding:"clamp(64px,10vw,120px) 24px",textAlign:"center"}}>
    {paymentConfirmed ? <ClearStoreCart sessionId={sessionId} /> : null}
    <p className="standard-eyebrow">THE AFRICA PLUG · STORE</p>
    <h1 style={{fontSize:"clamp(36px,7vw,64px)",letterSpacing:"-.05em",lineHeight:1.02,margin:"16px 0"}}>{paymentConfirmed ? "Payment confirmed." : "We’re checking your order."}</h1>
    <p style={{maxWidth:560,margin:"0 auto 28px",lineHeight:1.8,color:"#626469"}}>{paymentConfirmed
      ? "Stripe confirms your payment. Keep the payment receipt sent to your email. Use the secure download links below to access the digital products included in this order."
      : "We can’t confirm the payment from this page yet. Please check your Stripe receipt email and allow a few moments for the payment status to update. If you completed payment and are still unsure, contact The Africa Plug with your receipt."}</p>
    {paymentConfirmed ? <section aria-label="Your downloads" style={{maxWidth:580,margin:"0 auto 32px",textAlign:"left",padding:"20px",border:"1px solid #e2ddd5",background:"#fff"}}>
      <h2 style={{fontSize:19,margin:"0 0 12px"}}>Your downloads</h2>
      {downloadProducts.length ? <div style={{display:"grid",gap:10}}>{downloadProducts.map((product) => <a key={product.id} href={downloadLinks.get(product.slug!) || "#"} style={{display:"flex",justifyContent:"space-between",gap:14,alignItems:"center",padding:"13px 0",borderBottom:"1px solid #eee7df",color:"#292a2c",fontWeight:700,textDecoration:"none"}}><span>{product.title}</span><span aria-hidden="true">DOWNLOAD ↗</span></a>)}</div>
      : <p style={{margin:0,lineHeight:1.7,color:"#626469"}}>Your payment is confirmed, but a download link is not available for this order yet. Please contact us with your payment receipt so we can help.</p>}
      <p style={{fontSize:12,lineHeight:1.6,color:"#626469",margin:"12px 0 0"}}>Each private link allows up to five downloads and expires 30 days after it is issued.</p>
    </section> : null}
    <Link href="/contact" className="text-link">CONTACT THE AFRICA PLUG <span aria-hidden="true">→</span></Link>
    <span aria-hidden="true" style={{display:"inline-block",width:24}} />
    <Link href="/store" className="text-link">RETURN TO THE STORE <span aria-hidden="true">→</span></Link>
  </main>;
}