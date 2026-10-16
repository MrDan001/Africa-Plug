import Link from "next/link";

export default function BookShelf() {
  return <div className="tap-store-page">
    <section className="tap-store-hero" aria-labelledby="tap-store-heading">
      <div className="tap-store-hero-copy"><p className="tap-store-eyebrow">THE AFRICA PLUG</p><h1 id="tap-store-heading">THE STORE</h1><p className="tap-store-hero-description">Practical resources for clearer decisions and better-informed moves across Africa.</p></div>
      <aside className="tap-store-hero-aside"><span aria-hidden="true" style={{fontSize:42,fontWeight:300}}>↗</span><p>Knowledge.<br/>Tools.<br/>Possibility.</p></aside>
    </section>
    <section className="tap-store-catalogue" aria-label="Store products" style={{paddingTop:48,paddingBottom:64}}>
      <article className="standard-card" style={{maxWidth:980,margin:"0 auto",display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1.2fr)",gap:32,alignItems:"center",padding:"clamp(24px,5vw,56px)"}}>
        <div aria-hidden="true" style={{aspectRatio:"4/5",maxWidth:270,width:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:24,background:"#e9e5df",color:"#292a2c",border:"1px solid #d6d0c7"}}>
          <span style={{fontSize:10,fontWeight:900,letterSpacing:".14em"}}>THE AFRICA PLUG</span>
          <div><span style={{fontSize:10,fontWeight:800,letterSpacing:".12em",color:"#d51f6d"}}>FIELD GUIDE · 01</span><h2 style={{fontSize:"clamp(30px,4vw,44px)",lineHeight:.98,letterSpacing:"-.06em",margin:"12px 0"}}>THE AFRICA<br/>STARTER GUIDE</h2><span style={{display:"block",width:48,height:3,background:"#d51f6d"}}/></div>
          <span style={{fontSize:9,fontWeight:800,letterSpacing:".1em"}}>INVESTMENT • BUSINESS • ENTERTAINMENT</span>
        </div>
        <div><p className="standard-eyebrow">FIRST RELEASE</p><h2 style={{fontSize:"clamp(30px,4vw,48px)",lineHeight:1,letterSpacing:"-.05em",margin:"0 0 16px",color:"#292a2c"}}>The Africa Starter Guide</h2><p style={{color:"#626469",lineHeight:1.75}}>Our first Store release is being prepared. The Store will open when the finished guide, payment, receipt and secure delivery are ready. No placeholder catalogue or demo prices are being shown.</p><p style={{fontSize:11,fontWeight:800,letterSpacing:".08em",color:"#d51f6d",marginTop:24}}>COMING SOON</p><Link className="text-link" href="/contact">ASK ABOUT THE GUIDE <span aria-hidden="true">→</span></Link></div>
      </article>
    </section>
  </div>;
}
