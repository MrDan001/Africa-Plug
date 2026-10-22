// FILE PATH: src/components/store/StoreCatalogue.tsx
import Link from "next/link";
import { getPublicCmsRecords } from "@/lib/cms-bridge";
import ProductOfTheMonth from "@/components/store/ProductOfTheMonth";
import StoreAddToCartButton from "@/components/store/StoreAddToCartButton";
import StoreCartButton from "@/components/store/StoreCartButton";
import { cmsRecordToPublicProduct } from "@/lib/public-cms-content";
import { STORE_CATEGORIES, getStoreCategory, parseStoreCategory, type StoreCategoryId } from "@/lib/store-categories";
import "./store-categories.css";

export const dynamic = "force-dynamic";

type Props = { category?: string | string[] };

export default async function StoreCatalogue({ category }: Props) {
  const records = await getPublicCmsRecords("products");
  const products = records.map(cmsRecordToPublicProduct).filter((item): item is NonNullable<ReturnType<typeof cmsRecordToPublicProduct>> => item !== null);
  const selected = parseStoreCategory(category);
  const selectedInfo = selected ? getStoreCategory(selected) : null;
  const visible = selected ? products.filter((product) => product.category === selected) : products;
  const counts = Object.fromEntries(STORE_CATEGORIES.map((item) => [item.id, products.filter((product) => product.category === item.id).length])) as Record<StoreCategoryId, number>;
  const formatter = (value: number, currency: string) => {
    try { return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(value); }
    catch { return `${currency} ${value.toFixed(2)}`; }
  };

  return <div className="tap-store-page">
    <section className="tap-store-hero" aria-labelledby="tap-store-heading">
      <div className="tap-store-hero-copy"><p className="tap-store-eyebrow">THE AFRICA PLUG</p><h1 id="tap-store-heading">THE STORE</h1><p className="tap-store-hero-description">Ebooks, playbooks, reports, Stay Finder and other TAP products to help you make better-informed moves across Africa.</p></div>
      <aside className="tap-store-hero-aside"><span aria-hidden="true" style={{fontSize:42,fontWeight:300}}>↗</span><p>Knowledge.<br/>Tools.<br/>Possibility.</p><StoreCartButton /></aside>
    </section>
    <StoreCartButton mobileFloating />
    <ProductOfTheMonth />

    <div className="tap-cat-wrap">
      <nav className="tap-cat-nav" aria-label="Store categories">
        <ul>
          <li><Link href="/store" scroll={false} className={"tap-cat-chip" + (!selected ? " is-active" : "")} aria-current={!selected ? "page" : undefined}>All <span>{products.length}</span></Link></li>
          {STORE_CATEGORIES.map((item) => <li key={item.id}><Link href={`/store?category=${item.id}`} scroll={false} className={"tap-cat-chip" + (selected === item.id ? " is-active" : "") + (counts[item.id] === 0 ? " is-empty" : "")} aria-current={selected === item.id ? "page" : undefined}>{item.label} <span>{counts[item.id]}</span></Link></li>)}
        </ul>
      </nav>
      {selectedInfo ? <p className="tap-cat-intro"><strong>{selectedInfo.label}.</strong> {selectedInfo.blurb}</p> : null}
    </div>

    <section className="tap-store-catalogue" aria-label="Available Store products" style={{paddingTop:28,paddingBottom:64}}>
      {visible.length ? <div style={{maxWidth:1120,margin:"0 auto",padding:"0 clamp(16px,4vw,28px)",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,280px),1fr))",gap:22}}>
        {visible.map((product) => {
          const categoryInfo = getStoreCategory(product.category);
          const sellsHere = !product.externalUrl && product.price > 0 && product.downloadReady;
          return <article className="standard-card" key={product.id} style={{overflow:"hidden",display:"flex",flexDirection:"column"}}>
            {product.imageUrl ? <div style={{width:"100%",aspectRatio:"4/3",background:"#e9e5df"}}><img src={product.imageUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /></div> : <div aria-hidden="true" style={{aspectRatio:"4/3",display:"grid",placeItems:"center",background:"#e9e5df",color:"#292a2c",padding:20,fontWeight:800,textAlign:"center"}}>THE AFRICA PLUG<br/>{categoryInfo.singular}</div>}
            <div style={{padding:24,display:"flex",flexDirection:"column",alignItems:"start",flex:1}}>
              <p className="standard-eyebrow">{categoryInfo.singular}</p><h2 style={{fontSize:28,letterSpacing:"-.04em",lineHeight:1.05,margin:"0 0 12px",color:"#292a2c"}}>{product.title}</h2><p style={{color:"#626469",lineHeight:1.7,flex:1}}>{product.summary}</p>
              {product.externalUrl
                ? <strong style={{marginTop:8,color:"#626469",fontSize:13}}>Pricing and booking are set by the provider</strong>
                : <strong style={{marginTop:8,color:"#292a2c"}}>{product.price > 0 ? formatter(product.price, product.currency) : "Price to be confirmed"}</strong>}
              <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",marginTop:20}}>
                {product.externalUrl
                  ? <a className="tap-cat-external" href={product.externalUrl} target="_blank" rel="noopener noreferrer sponsored">{product.category === "stay-finder" ? "FIND A STAY" : "VISIT"} <span aria-hidden="true">↗</span></a>
                  : sellsHere
                    ? <StoreAddToCartButton slug={product.slug} title={product.title} price={String(product.price)} currency={product.currency} cover="starter" compact={false} />
                    : <span style={{fontSize:11,fontWeight:800,letterSpacing:".06em",color:"#777"}}>{product.price > 0 ? "PREPARING DIGITAL DELIVERY" : "PRICING TO BE CONFIRMED"}</span>}
                <Link href={`/store/${product.slug}`} className="text-link">VIEW PRODUCT <span aria-hidden="true">→</span></Link>
              </div>
            </div>
          </article>;
        })}
      </div> : selectedInfo ? <article className="tap-cat-empty">
        <p className="standard-eyebrow">COMING SOON</p>
        <h2>{selectedInfo.emptyTitle}</h2>
        <p>{selectedInfo.blurb} Nothing is published here yet, but it will appear as soon as it is ready.</p>
        <Link className="text-link" href="/store">BACK TO ALL PRODUCTS <span aria-hidden="true">→</span></Link>
      </article> : <article className="standard-card" style={{maxWidth:980,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,250px),1fr))",gap:32,alignItems:"center",padding:"clamp(24px,5vw,56px)"}}>
        <div aria-hidden="true" style={{aspectRatio:"4/5",maxWidth:270,width:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:24,background:"#e9e5df",color:"#292a2c",border:"1px solid #d6d0c7"}}>
          <span style={{fontSize:10,fontWeight:900,letterSpacing:".14em"}}>THE AFRICA PLUG</span>
          <div><span style={{fontSize:10,fontWeight:800,letterSpacing:".12em",color:"#d51f6d"}}>DIGITAL RESOURCE · 01</span><h2 style={{fontSize:"clamp(30px,4vw,44px)",lineHeight:.98,letterSpacing:"-.06em",margin:"12px 0"}}>IDEAS INTO<br/>ACTION</h2><span style={{display:"block",width:48,height:3,background:"#d51f6d"}}/></div>
          <span style={{fontSize:9,fontWeight:800,letterSpacing:".1em"}}>KNOWLEDGE • TOOLS • RESEARCH</span>
        </div>
        <div><p className="standard-eyebrow">FIRST RELEASE</p><h2 style={{fontSize:"clamp(30px,4vw,48px)",lineHeight:1,letterSpacing:"-.05em",margin:"0 0 16px",color:"#292a2c"}}>Useful resources. Coming soon.</h2><p style={{color:"#626469",lineHeight:1.75}}>We’re preparing ebooks, playbooks, reports, Stay Finder and other TAP products. Published products will appear here when they’re ready.</p><p style={{fontSize:11,fontWeight:800,letterSpacing:".08em",color:"#d51f6d",marginTop:24}}>MORE FROM TAP, ON THE WAY</p><Link className="text-link" href="/contact">ASK ABOUT TAP PRODUCTS <span aria-hidden="true">→</span></Link></div>
      </article>}
      {selectedInfo && selected === "stay-finder" && visible.length ? <p className="tap-cat-note" style={{maxWidth:1120,margin:"18px auto 0",padding:"0 clamp(16px,4vw,28px)"}}>Stay Finder links take you to accommodation providers, who handle bookings, prices and payment directly.</p> : null}
    </section>
  </div>;
}