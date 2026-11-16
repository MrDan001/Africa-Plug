import { redirect } from "next/navigation";
import Link from "next/link";
import { getStripe } from "@/lib/payments/stripe";

export const dynamic = "force-dynamic";
export const metadata = { title: "Confirming your call payment | The Africa Plug", robots: { index: false, follow: false } };
type Props = { searchParams: Promise<{ session_id?: string | string[] }> };

export default async function CallCheckoutSuccess({ searchParams }: Props) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : "";
  if (/^cs_(test|live)_[A-Za-z0-9_]+$/.test(sessionId)) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid" && session.metadata?.service === "fk-30-minute-call") redirect("https://cal.com/theafricaplug/fkcall01");
    } catch (error) {
      if (error && typeof error === "object" && "digest" in error) throw error;
    }
  }
  return <main style={{maxWidth:680,margin:"0 auto",padding:"80px 24px",textAlign:"center"}}>
    <p className="standard-eyebrow">THE AFRICA PLUG · WORK WITH FK</p>
    <h1 style={{fontSize:"clamp(32px,6vw,52px)"}}>We’re checking your payment.</h1>
    <p style={{lineHeight:1.8,color:"#626469"}}>We can’t verify a completed payment for this call yet. If you have paid, please check your Stripe receipt and contact us with your session details.</p>
    <Link href="/work-with-fk/call" className="text-link">RETURN TO THE CALL PAGE →</Link>
  </main>;
}
