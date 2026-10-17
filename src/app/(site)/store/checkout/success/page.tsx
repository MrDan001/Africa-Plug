import Link from "next/link";

export const metadata = { title: "Order received | The Africa Plug Store", robots: { index: false, follow: false } };

export default function StoreCheckoutSuccessPage() {
  return <main style={{maxWidth:760,margin:"0 auto",padding:"clamp(64px,10vw,120px) 24px",textAlign:"center"}}>
    <p className="standard-eyebrow">THE AFRICA PLUG · STORE</p>
    <h1 style={{fontSize:"clamp(36px,7vw,64px)",letterSpacing:"-.05em",lineHeight:1.02,margin:"16px 0"}}>Thank you for your order.</h1>
    <p style={{maxWidth:560,margin:"0 auto 28px",lineHeight:1.8,color:"#626469"}}>Stripe has returned you to Africa Plug. Your payment and order confirmation are being verified. Please check your email for Stripe’s payment receipt. Digital delivery will be confirmed separately when it is available for your product.</p>
    <Link href="/store" className="text-link">RETURN TO THE STORE <span aria-hidden="true">→</span></Link>
  </main>;
}
