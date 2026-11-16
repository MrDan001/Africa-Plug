import Link from "next/link";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/payments/stripe";
import { loadApplication, paymentConfirmed, saveApplicationData } from "@/lib/work-with-fk/scheduler";
export const dynamic = "force-dynamic";
export const metadata = { title: "Confirming Deal Diagnostic payment | The Africa Plug", robots: { index: false, follow: false } };
type Props = { searchParams: Promise<{ session_id?: string | string[] }> };
export default async function DealDiagnosticCheckoutSuccess({ searchParams }: Props) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : "";
  if (/^cs_(test|live)_[A-Za-z0-9_]+$/.test(sessionId)) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      const applicationId = session.metadata?.application_id;
      if (session.payment_status === "paid" && session.metadata?.service === "fk-deal-diagnostic" && session.currency === "gbp" && session.amount_total === 250000 && applicationId && session.client_reference_id === applicationId) {
        const application = await loadApplication(applicationId);
        if (application?.status === "approved") {
          if (!paymentConfirmed(application) || application.data?.paymentMethod !== "stripe") await saveApplicationData(application, { paymentStatus: "confirmed", paymentMethod: "stripe", paymentPaidAt: new Date().toISOString(), paymentConfirmedAt: new Date().toISOString(), stripeCheckoutSessionId: session.id });
          redirect("https://cal.com/theafricaplug/deal01");
        }
      }
    } catch (error) {
      if (error && typeof error === "object" && "digest" in error) throw error;
      console.error("Deal Diagnostic payment verification failed:", error instanceof Error ? error.message : "Unknown error");
    }
  }
  return <main style={{maxWidth:680,margin:"0 auto",padding:"80px 24px",textAlign:"center"}}>
    <p className="standard-eyebrow">THE AFRICA PLUG · WORK WITH FK</p>
    <h1 style={{fontSize:"clamp(32px,6vw,52px)"}}>We’re checking your payment.</h1>
    <p style={{lineHeight:1.8,color:"#626469"}}>We can’t verify a completed Deal Diagnostic payment yet. If you have paid, please contact the team with your Stripe receipt.</p>
    <Link href="/work-with-fk" className="text-link">RETURN TO WORK WITH FK →</Link>
  </main>;
}