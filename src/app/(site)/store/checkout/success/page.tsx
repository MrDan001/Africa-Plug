import Link from "next/link";
import { getStripe } from "@/lib/payments/stripe";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order received | The Africa Plug Store", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ session_id?: string | string[] }> };

export default async function StoreCheckoutSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : "";
  let paymentConfirmed = false;

  if (/^cs_(test|live)_[A-Za-z0-9_]+$/.test(sessionId)) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      paymentConfirmed = session.payment_status === "paid" && session.metadata?.store === "africa-plug";
    } catch {
      // Keep the page safe if Stripe configuration or the session lookup is unavailable.
    }
  }

  return <main style={{maxWidth:760,margin:"0 auto",padding:"clamp(64px,10vw,120px) 24px",textAlign:"center"}}>
    <p className="standard-eyebrow">THE AFRICA PLUG · STORE</p>
    <h1 style={{fontSize:"clamp(36px,7vw,64px)",letterSpacing:"-.05em",lineHeight:1.02,margin:"16px 0"}}>{paymentConfirmed ? "Payment confirmed." : "We’re checking your order."}</h1>
    <p style={{maxWidth:560,margin:"0 auto 28px",lineHeight:1.8,color:"#626469"}}>{paymentConfirmed
      ? "Stripe confirms your payment. Please keep the payment receipt sent to your email. Digital product access is not yet automated for every Store item; we will follow up with access details where applicable."
      : "We can’t confirm the payment from this page yet. Please check your Stripe receipt email and allow a few moments for the payment status to update. If you completed payment and are still unsure, contact The Africa Plug with your receipt."}</p>
    <Link href="/contact" className="text-link">CONTACT THE AFRICA PLUG <span aria-hidden="true">→</span></Link>
    <span aria-hidden="true" style={{display:"inline-block",width:24}} />
    <Link href="/store" className="text-link">RETURN TO THE STORE <span aria-hidden="true">→</span></Link>
  </main>;
}
