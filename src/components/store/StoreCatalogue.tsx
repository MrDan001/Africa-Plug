// FILE PATH: src/components/store/StoreCatalogue.tsx
import Link from "next/link";
import { getPublicCmsRecords } from "@/lib/cms-bridge";
import ProductOfTheMonth from "@/components/store/ProductOfTheMonth";
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
      <div className="tap-store-hero-copy"><p className="tap-store-eyebrow">THE AFRICA PLUG</p><h1 id="tap-store-heading">THE STORE</h1><p className="tap-store-hero-description">Practical resources for clearer decisions and better-informed moves across Africa.</p></div>
      <aside className="tap-store-hero-aside"><span aria-hidden="true" style={{fontSize:42,fontWeight:300}}>↗</span><p>Knowledge.<br/>Tools.<br/>Possibility.</p></aside>
    </section>
    <ProductOfTheMonth />
    <section className="tap-store-catalogue" aria-label="Store products" style={{paddingTop:48,paddingBottom:64}}>
      {products.length ? <div style={{maxWidth:1120,margin:"0 auto",padding:"0 clamp(16px,4vw,28px)",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,280px),1fr))",gap:22}}>
        {products.map((product) => <article className="standard-card" key={product.id} style={{overflow:"hidden",display:"flex",flexDirection:"column"}}>
          {product.imageUrl ? <div style={{width:"100%",aspectRatio:"4/3",background:"#e9e5df"}}><img src={product.imageUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /></div> : <div aria-hidden="true" style={{aspectRatio:"4/3",display:"grid",placeItems:"center",background:"#e9e5df",color:"#292a2c",padding:20,fontWeight:800,textAlign:"center"}}>THE AFRICA PLUG<br/>{product.productType}</div>}
          <div style={{padding:24,display:"flex",flexDirection:"column",alignItems:"start",flex:1}}>
            <p className="standard-eyebrow">{product.productType}</p><h2 style={{fontSize:28,letterSpacing:"-.04em",lineHeight:1.05,margin:"0 0 12px",color:"#292a2c"}}>{product.title}</h2><p style={{color:"#626469",lineHeight:1.7,flex:1}}>{product.summary}</p>
            <strong style={{marginTop:8,color:"#292a2c"}}>{product.price > 0 ? formatter(product.price, product.currency) : "Price to be confirmed"}</strong>
            <Link href={`/store/${product.slug}`} className="text-link" style={{marginTop:20}}>VIEW RESOURCE <span aria-hidden="true">→</span></Link>
          </div>
        </article>)}
      </div> : <article className="standard-card" style={{maxWidth:980,margin:"0 auto",display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1.2fr)",gap:32,alignItems:"center",padding:"clamp(24px,5vw,56px)"}}>
        <div aria-hidden="true" style={{aspectRatio:"4/5",maxWidth:270,width:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:24,background:"#e9e5df",color:"#292a2c",border:"1px solid #d6d0c7"}}>
          <span style={{fontSize:10,fontWeight:900,letterSpacing:".14em"}}>THE AFRICA PLUG</span>
          <div><span style={{fontSize:10,fontWeight:800,letterSpacing:".12em",color:"#d51f6d"}}>FIELD GUIDE · 01</span><h2 style={{fontSize:"clamp(30px,4vw,44px)",lineHeight:.98,letterSpacing:"-.06em",margin:"12px 0"}}>THE AFRICA<br/>STARTER GUIDE</h2><span style={{display:"block",width:48,height:3,background:"#d51f6d"}}/></div>
          <span style={{fontSize:9,fontWeight:800,letterSpacing:".1em"}}>INVESTMENT • BUSINESS • ENTERTAINMENT</span>
        </div>
        <div><p className="standard-eyebrow">FIRST RELEASE</p><h2 style={{fontSize:"clamp(30px,4vw,48px)",lineHeight:1,letterSpacing:"-.05em",margin:"0 0 16px",color:"#292a2c"}}>The Africa Starter Guide</h2><p style={{color:"#626469",lineHeight:1.75}}>The Africa Starter Guide is being finished and will be available here when it is ready.</p><p style={{fontSize:11,fontWeight:800,letterSpacing:".08em",color:"#d51f6d",marginTop:24}}>COMING SOON</p><Link className="text-link" href="/contact">ASK ABOUT THE GUIDE <span aria-hidden="true">→</span></Link></div>
      </article>}
    </section>
  </div>;
}