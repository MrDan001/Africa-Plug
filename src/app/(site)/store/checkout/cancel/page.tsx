import Link from "next/link";

export const metadata = { title: "Checkout cancelled | The Africa Plug Store", robots: { index: false, follow: false } };

export default function StoreCheckoutCancelPage() {
  return <main style={{maxWidth:720,margin:"0 auto",padding:"clamp(64px,10vw,120px) 24px",textAlign:"center"}}>
    <p className="standard-eyebrow">THE AFRICA PLUG · STORE</p>
    <h1 style={{fontSize:"clamp(36px,7vw,60px)",letterSpacing:"-.05em",lineHeight:1.02,margin:"16px 0"}}>No payment was completed.</h1>
    <p style={{maxWidth:520,margin:"0 auto 28px",lineHeight:1.8,color:"#626469"}}>Your checkout was cancelled. You can return to the Store and try again whenever you’re ready.</p>
    <Link href="/store" className="text-link">BACK TO THE STORE <span aria-hidden="true">→</span></Link>
  </main>;
}
