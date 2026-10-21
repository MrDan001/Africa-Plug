// FILE PATH: src/components/store/StoreCatalogue.tsx
import Link from "next/link";
import { getPublicCmsRecords } from "@/lib/cms-bridge";
import ProductOfTheMonth from "@/components/store/ProductOfTheMonth";
import StoreAddToCartButton from "@/components/store/StoreAddToCartButton";
import StoreCartButton from "@/components/store/StoreCartButton";
import { cmsRecordToPublicProduct } from "@/lib/public-cms-content";

export const dynamic = "force-dynamic";

export default async function StoreCatalogue() {
  const records = await getPublicCmsRecords("products");
  const products = records.map(cmsRecordToPublicProduct).filter((item): item is NonNullable<ReturnType<typeof cmsRecordToPublicProduct>> => item !== null);
  const formatter = (value: number, currency: string) => {
    try { return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(value); }
    catch { return `${currency} ${value.toFixed(2)}`; }
  };

  return <div className="tap-store-page">
    <section className="tap-store-hero" aria-labelledby="tap-store-heading">
      <div className="tap-store-hero-copy"><p className="tap-store-eyebrow">THE AFRICA PLUG</p><h1 id="tap-store-heading">THE STORE</h1><p className="tap-store-hero-description">Digital products, practical playbooks and research to help you make better-informed moves across Africa.</p></div>
      <aside className="tap-store-hero-aside"><span aria-hidden="true" style={{fontSize:42,fontWeight:300}}>↗</span><p>Knowledge.<br/>Tools.<br/>Possibility.</p><StoreCartButton /></aside>
    </section>
    {/*
  Introductory category labels intentionally hidden on the public Store page.
  The offerings remain available through the catalogue without this explanatory card grid.
  <section aria-label="What you will find" style={{maxWidth:1120,margin:"0 auto",padding:"28px clamp(16px,4vw,28px) 0",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,190px),1fr))",gap:12}}>
      {[
        { title: "Ebooks & Playbooks", detail: "Guides and practical frameworks." },
        { title: "Reports & Research", detail: "Insights to inform your next move." },
        { title: "TAP Products", detail: "Useful products from The Africa Plug." },
        { title: "Stay Finder", detail: "Discover places to stay, with bookings handled by accommodation providers." },
      ].map((item) => <article key={item.title} style={{border:"1px solid #e2ddd5",background:"#fff",padding:"18px 20px",borderRadius:4}}>
        <h2 style={{fontSize:15,margin:"0 0 7px",color:"#292a2c",letterSpacing:"-.02em"}}>{item.title}</h2>
        <p style={{fontSize:13,lineHeight:1.6,color:"#626469",margin:0}}>{item.detail}</p>
      </article>)}
    </section>
*/}
    <ProductOfTheMonth />
    <section className="tap-store-catalogue" aria-label="Available Store products" style={{paddingTop:40,paddingBottom:64}}>
      {products.length ? <div style={{maxWidth:1120,margin:"0 auto",padding:"0 clamp(16px,4vw,28px)",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,280px),1fr))",gap:22}}>
        {products.map((product) => <article className="standard-card" key={product.id} style={{overflow:"hidden",display:"flex",flexDirection:"column"}}>
          {product.imageUrl ? <div style={{width:"100%",aspectRatio:"4/3",background:"#e9e5df"}}><img src={product.imageUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /></div> : <div aria-hidden="true" style={{aspectRatio:"4/3",display:"grid",placeItems:"center",background:"#e9e5df",color:"#292a2c",padding:20,fontWeight:800,textAlign:"center"}}>THE AFRICA PLUG<br/>{product.productType}</div>}
          <div style={{padding:24,display:"flex",flexDirection:"column",alignItems:"start",flex:1}}>
            <p className="standard-eyebrow">{product.productType}</p><h2 style={{fontSize:28,letterSpacing:"-.04em",lineHeight:1.05,margin:"0 0 12px",color:"#292a2c"}}>{product.title}</h2><p style={{color:"#626469",lineHeight:1.7,flex:1}}>{product.summary}</p>
            <strong style={{marginTop:8,color:"#292a2c"}}>{product.price > 0 ? formatter(product.price, product.currency) : "Price to be confirmed"}</strong>
            <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",marginTop:20}}>{product.price > 0 && product.downloadReady ? <StoreAddToCartButton slug={product.slug} title={product.title} price={String(product.price)} currency={product.currency} cover="starter" compact={false} /> : <span style={{fontSize:11,fontWeight:800,letterSpacing:".06em",color:"#777"}}>{product.price > 0 ? "PREPARING DIGITAL DELIVERY" : "PRICING TO BE CONFIRMED"}</span>}<Link href={`/store/${product.slug}`} className="text-link">VIEW PRODUCT <span aria-hidden="true">→</span></Link></div>
          </div>
        </article>)}
      </div> : <article className="standard-card" style={{maxWidth:980,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,250px),1fr))",gap:32,alignItems:"center",padding:"clamp(24px,5vw,56px)"}}>
        <div aria-hidden="true" style={{aspectRatio:"4/5",maxWidth:270,width:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:24,background:"#e9e5df",color:"#292a2c",border:"1px solid #d6d0c7"}}>
          <span style={{fontSize:10,fontWeight:900,letterSpacing:".14em"}}>THE AFRICA PLUG</span>
          <div><span style={{fontSize:10,fontWeight:800,letterSpacing:".12em",color:"#d51f6d"}}>DIGITAL RESOURCE · 01</span><h2 style={{fontSize:"clamp(30px,4vw,44px)",lineHeight:.98,letterSpacing:"-.06em",margin:"12px 0"}}>IDEAS INTO<br/>ACTION</h2><span style={{display:"block",width:48,height:3,background:"#d51f6d"}}/></div>
          <span style={{fontSize:9,fontWeight:800,letterSpacing:".1em"}}>KNOWLEDGE • TOOLS • RESEARCH</span>
        </div>
        <div><p className="standard-eyebrow">FIRST RELEASE</p><h2 style={{fontSize:"clamp(30px,4vw,48px)",lineHeight:1,letterSpacing:"-.05em",margin:"0 0 16px",color:"#292a2c"}}>Useful resources. Coming soon.</h2><p style={{color:"#626469",lineHeight:1.75}}>We’re preparing a growing collection of ebooks, playbooks, reports and other TAP products. Published products will appear here when they’re ready.</p><p style={{fontSize:11,fontWeight:800,letterSpacing:".08em",color:"#d51f6d",marginTop:24}}>MORE FROM TAP, ON THE WAY</p><Link className="text-link" href="/contact">ASK ABOUT TAP PRODUCTS <span aria-hidden="true">→</span></Link></div>
      </article>}
    </section>
  </div>;
}