import FeaturedStories from "@/components/blog/FeaturedStories";
import NewsletterSignup from "@/components/home/NewsletterSignup";
import { listLiveOpportunities } from "@/lib/tap-in/opportunities";
import { cmsRecordToPublicProduct } from "@/lib/public-cms-content";
import { getPublicSiteSettings as getSettings, getPublicCmsRecords } from "@/lib/cms-bridge";

export default async function HomeSections() {
  const [opportunities, settings, productRecords] = await Promise.all([
    listLiveOpportunities().catch(() => []),
    getSettings(),
    getPublicCmsRecords("products"),
  ]);
  const featuredProducts = productRecords
    .map(cmsRecordToPublicProduct)
    .filter((item): item is NonNullable<ReturnType<typeof cmsRecordToPublicProduct>> => item !== null);
  const featuredProduct = featuredProducts.find((product) => product.featured) ?? featuredProducts[0] ?? null;
  const contactEmail = settings.contactEmail || "connect@theafricaplug.com";
  const showSelectedWork = settings.enableSelectedWork !== false;
  const showProductOfMonth = settings.enableProductOfMonth === true;
  const showNewsletter = settings.enableNewsletter !== false;

  return <>
    <section className="intro-section section-grid" id="about">
      <div className="intro-video-card" aria-label="The Africa Plug introduction video" style={{position:"relative",width:"100%",aspectRatio:"16 / 9",minHeight:260,overflow:"hidden",background:"#e9e5df"}}>
        <div className="intro-video-pending"><span className="intro-video-pending-mark" aria-hidden="true">▶</span><p className="eyebrow">INTRODUCTION</p><h3>The Africa Plug, on the ground.</h3><p>The approved FK introduction film will appear here when the final cut and captions are ready.</p></div>
      </div>
      <div className="intro-copy"><p className="eyebrow">MEET FK</p><h2>A MORE CONNECTED WAY TO ENGAGE WITH AFRICA</h2><p>The Africa Plug connects commercial ambition with context, relationships and opportunities across African markets. We help people ask better questions, find relevant routes in and move with greater clarity.</p><a className="text-link" href="/about">ABOUT THE AFRICA PLUG <span>→</span></a></div>
    </section>

    <section className="work-section content-section" id="work-with-fk">
      <div className="work-intro"><p className="eyebrow">AFRICA COMMERCIAL DEAL CONSULTANCY</p><h2>WORK WITH FK</h2><p>For businesses entering a market, expanding across Africa, or navigating a commercial challenge or opportunity.</p><a className="button button-pink" href="/work-with-fk/apply">START YOUR APPLICATION <span>→</span></a><a className="text-link" href="/work-with-fk">UNDERSTAND THE PROCESS</a></div>
      <div className="proof-area" id="process">
        <div className="proof-label"><span className="line-icon">01</span><div><b>APPLICATION</b><small>Share your commercial brief.</small></div></div>
        <div className="proof-label"><span className="line-icon">02</span><div><b>REVIEW</b><small>We assess fit and readiness.</small></div></div>
        <div className="proof-label"><span className="line-icon">03</span><div><b>APPROVAL & NEXT STEPS</b><small>Clear terms before payment.</small></div></div>
      </div>
    </section>

    {showSelectedWork ? <section className="content-section" id="selected-work" style={{padding:"clamp(48px,8vw,100px) clamp(20px,6vw,90px)",background:"#f1efeb",color:"#292a2c"}}>
      <div style={{maxWidth:1200,margin:"0 auto"}}><p className="eyebrow">SELECTED WORK</p><h2 style={{fontSize:"clamp(32px,5vw,56px)",letterSpacing:"-.05em",margin:"0 0 14px"}}>Commercial work, shared responsibly.</h2><p style={{maxWidth:650,color:"#626469",lineHeight:1.75}}>This space is reserved for genuine, NDA-safe examples of work. Case studies will be added when approved for publication; no client names or placeholder testimonials are displayed.</p></div>
    </section> : null}

    <section className="content-section" id="tap-in" style={{padding:"clamp(48px,8vw,100px) clamp(20px,6vw,90px)"}}>
      <div style={{maxWidth:1200,margin:"0 auto"}}><div className="standard-section-heading"><p className="standard-eyebrow">TAP IN</p><h2>Current opportunities.</h2><p>Only genuinely approved live opportunities appear here. No demo listings or invented opportunities.</p></div>
      {opportunities.length ? <div className="standard-card-grid">{opportunities.slice(0,3).map((item)=><article className="standard-card" key={item.id}><p className="standard-card-category">{[item.sector,item.opportunity_type].filter(Boolean).join(" · ")}</p><h3>{item.title}</h3><p>{item.description}</p><p className="standard-card-category">{[item.country,item.region].filter(Boolean).join(" · ")}</p><a className="text-link" href={"/tap-in/"+item.slug}>VIEW OPPORTUNITY <span>→</span></a></article>)}</div> : <div className="standard-note"><div><h3>No current opportunities to display.</h3><p>Listings will appear here when genuine opportunities have been reviewed and approved for publication.</p></div><a href="/tap-in">ABOUT TAP IN <span>→</span></a></div>}
      <a className="text-link" href="/tap-in">EXPLORE TAP IN <span>→</span></a></div>
    </section>

    {showProductOfMonth ? <section className="content-section" id="store" style={{padding:"clamp(42px,7vw,84px) clamp(20px,6vw,90px)",background:"#f7f5f1",color:"#292a2c"}}>
      <div style={{maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:30,alignItems:"center"}}>
        <div><p className="eyebrow">THE STORE · FIRST RELEASE</p><h2 style={{fontSize:"clamp(32px,5vw,54px)",letterSpacing:"-.05em",lineHeight:1,margin:"0 0 15px"}}>{featuredProduct?.title || "The Africa Starter Guide"}</h2><p style={{maxWidth:500,color:"#626469",lineHeight:1.7}}>{featuredProduct?.summary || "The Store’s first release is being prepared. The Africa Starter Guide will be published when the finished product and delivery setup are ready."}</p>{featuredProduct && featuredProduct.price > 0 ? <p style={{fontWeight:800,color:"#292a2c"}}>{new Intl.NumberFormat("en-GB",{style:"currency",currency:featuredProduct.currency}).format(featuredProduct.price)}</p> : null}<a className="button button-pink" href={featuredProduct ? `/store/${featuredProduct.slug}` : "/store"}>{featuredProduct ? "VIEW FEATURED RESOURCE" : "VISIT THE STORE"} <span>→</span></a></div>
        <div style={{padding:28,background:"#e9e5df",border:"1px solid #d6d0c7"}}>{featuredProduct?.imageUrl ? <img src={featuredProduct.imageUrl} alt="" style={{display:"block",width:"100%",maxHeight:340,objectFit:"cover",marginBottom:18}} /> : null}<p className="eyebrow">{featuredProduct?.productType || "FIRST RELEASE"}</p><h3 style={{fontSize:30,lineHeight:1,letterSpacing:"-.04em",margin:"0 0 12px"}}>{featuredProduct?.title || "The Africa Starter Guide"}</h3><p style={{color:"#626469",lineHeight:1.6}}>{featuredProduct ? "A resource from The Africa Plug Store." : "The first release is in preparation. Product details and availability will be confirmed before launch."}</p></div>
      </div>
    </section> : null}

    <FeaturedStories variant="home" />

    <section className="content-section" id="partner-with-tap" style={{padding:"clamp(48px,8vw,100px) clamp(20px,6vw,90px)"}}>
      <div style={{maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:32}}><div><p className="eyebrow">PARTNER WITH TAP</p><h2 style={{fontSize:"clamp(32px,5vw,52px)",letterSpacing:"-.05em",lineHeight:1,margin:"0 0 15px"}}>Build something relevant.</h2><p style={{maxWidth:520,color:"#626469",lineHeight:1.7}}>For sponsorship, brand partnerships, interviews, events, tourism, institutional work and content collaborations.</p><a className="button button-outline" href="/contact?type=partner">EXPLORE PARTNERSHIPS <span>→</span></a></div><div id="contact"><p className="eyebrow">CONTACT & QUESTIONS</p><h2 style={{fontSize:30,letterSpacing:"-.04em",margin:"0 0 12px"}}>Start a conversation.</h2><p style={{color:"#626469",lineHeight:1.7}}>For general enquiries, questions or partnership proposals, contact the team.</p><a className="text-link" href="/contact">CONTACT THE AFRICA PLUG <span>→</span></a><p style={{marginTop:20}}><a href={`mailto:${contactEmail}`}>{contactEmail}</a></p></div></div>
    </section>

    {showNewsletter ? <NewsletterSignup /> : null}
  </>;
}
