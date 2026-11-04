// FILE PATH: src/components/home/HomeSections.tsx
import Link from "next/link";
import FeaturedStories from "@/components/blog/FeaturedStories";
import IntroVideo from "@/components/home/IntroVideo";
import NewsletterSignup from "@/components/home/NewsletterSignup";
import { listLiveOpportunities } from "@/lib/tap-in/opportunities";
import { getPublicSiteSettings as getSettings } from "@/lib/cms-bridge";
import { PartnershipTrigger } from "@/components/forms/PartnershipDialog";
import "./homepage-reference.css";

export default async function HomeSections() {
  const [opportunities, settings] = await Promise.all([
    listLiveOpportunities().catch(() => []),
    getSettings(),
  ]);
  const contactEmail = settings.contactEmail || "connect@theafricaplug.com";
  const showSelectedWork = settings.enableSelectedWork !== false;
  const showNewsletter = settings.enableNewsletter === true;
  const videoIdToUse = settings.introVideoId?.trim() || null;

  return <>
    <section className="homepage-tagline-band" aria-label="The Africa Plug positioning">
      <div className="homepage-tagline-copy"><span>THE AFRICA PLUG</span><strong>Your connection to Africa.</strong></div>
      <p>INVESTMENT <i>·</i> BUSINESS <i>·</i> ENTERTAINMENT</p>
    </section>

    <section className="intro-section section-grid home-intro-reference" id="about">
      <div className="intro-video-card" aria-label="The Africa Plug introduction video">
        {videoIdToUse ? <IntroVideo videoId={videoIdToUse} /> : <div style={{height:"100%",minHeight:260,display:"grid",placeItems:"center",padding:32,background:"#000",color:"#fff",textAlign:"center"}}><div><p className="eyebrow" style={{color:"#db2777",fontWeight:"bold"}}>THE AFRICA PLUG</p><p style={{margin:0,fontSize:"clamp(24px,4vw,42px)",lineHeight:1,letterSpacing:"-.04em"}}>Connecting people, context and opportunity across Africa.</p></div></div>}
      </div>
      <div className="intro-copy"><p className="eyebrow">MEET FK</p><h2>SHE KNOWS HOW DEALS GET DONE IN AFRICA.</h2><p>FK is an Africa Commercial Deal Consultant and the founder of The Africa Plug. With 10 years operating in Nigeria and experience across the continent, the UK, the US, Asia and the Middle East, she understands the difference between how business is supposed to work and how it really gets done.</p><Link className="text-link" href="/about#founder">ABOUT FK <span>→</span></Link></div>
    </section>

    <section className="work-section content-section home-work-reference" id="work-with-fk">
      <div className="work-intro"><p className="eyebrow">AFRICA COMMERCIAL DEAL CONSULTANCY</p><h2>WORK WITH FK</h2></div>
      <div className="work-copy"><p>Companies arrive from the US, the UAE, China and Europe with capital, a strategy and a deadline. What derails them is rarely the market. It’s the wrong partner, the wrong structure or the six month delay nobody planned for. FK sees those coming before they cost you.</p><p>Her clients include Nestlé, Oracle, LVMH, MTN and FirstBank Group, alongside others she can’t name under NDA.</p></div>
    </section>

    {showSelectedWork ? <section className="homepage-selected-work" id="selected-work">
      <div className="homepage-section-inner">
        <p className="eyebrow">SELECTED WORK</p>
        <h2>THE NAMES STAY PRIVATE.<br />THE RESULTS DON’T.</h2>
        <div className="homepage-case-grid">
          <article><span>01</span><p className="homepage-case-type">MARKET ENTRY</p><h3>Fortune Global 500 Consumer Goods Group</h3><p>The client wanted into a complicated market without learning the hard way.</p><strong>FK found the right local partner, mapped the route to market and guided the engagement through to a successful launch.</strong></article>
          <article><span>02</span><p className="homepage-case-type">GOVERNMENT AND REGULATORY</p><h3>Sovereign Backed Infrastructure Investor</h3><p>Plenty of institutions, plenty of moving parts.</p><strong>FK led stakeholder engagement and coordinated the regulatory process, securing the required pathway five months ahead of schedule.</strong></article>
          <article><span>03</span><p className="homepage-case-type">PAN AFRICAN DEALS</p><h3>Multinational Commodities Buyer</h3><p>The client needed the right counterparties across borders.</p><strong>FK identified and vetted counterparties, brought the parties together and closed commercial agreements across four countries.</strong></article>
        </div>
        <Link className="button button-pink homepage-case-cta" href="/work-with-fk/apply">START YOUR APPLICATION <span>→</span></Link>
      </div>
    </section> : null}

    <section className="homepage-tapin-section" id="tap-in">
      <div className="homepage-section-inner">
        <header className="homepage-tapin-heading"><div><p className="eyebrow">T.A.P IN</p><h2>Current opportunities.</h2><p>Business and investment opportunities that are open now.</p></div></header>
        {opportunities.length ? <div className="homepage-opportunity-list">{opportunities.slice(0, 2).map((item) => {
          const fallbackImage = /excavator/i.test(`${item.title} ${item.slug}`) ? "/images/tap-in/excavator-hire.jpg" : /honey/i.test(`${item.title} ${item.slug}`) ? "/images/tap-in/honey-supply.jpg" : null;
          const image = item.image_url || fallbackImage;
          return <Link className="homepage-opportunity-row" href={`/tap-in/${item.slug}`} key={item.id}>
            {image ? <img src={image} alt={`${item.title} opportunity`} /> : <span className="homepage-opportunity-placeholder" aria-hidden="true" />}
            <span className="homepage-opportunity-copy"><strong>{item.title}</strong><small>{item.opportunity_type || item.sector}</small><span>{item.description}</span></span>
            <span className="homepage-opportunity-arrow" aria-hidden="true">→</span>
          </Link>;
        })}</div> : <div className="homepage-opportunity-empty"><strong>New opportunities are on the way.</strong><span>Check back soon for current business and investment opportunities across Africa.</span></div>}
        <Link className="homepage-section-link" href="/tap-in">EXPLORE T.A.P IN <span>→</span></Link>
      </div>
    </section>

    <section className="homepage-store-section" id="store">
      <div className="homepage-store-inner">
        <div className="homepage-store-copy"><h2>THE STORE</h2><Link className="button button-pink" href="/store">GO TO OUR STORE <span>→</span></Link></div>
        <div className="homepage-store-art" role="img" aria-label="The Africa Plug Explore Africa Like an Insider guide, with phone and tablet previews">
          <div className="homepage-store-device homepage-store-phone"><span>Practical guides.</span><small>Explore more of Africa with local know how.</small></div>
          <div className="homepage-store-device homepage-store-tablet"><span>Cultural insights.</span><small>Local know how.</small><img src="/images/tap-in/port-aerial.jpg" alt="" /></div>
          <img className="homepage-store-book" src="/store/explore.webp" alt="The Africa Plug Explore Africa Like an Insider guide cover" />
        </div>
      </div>
    </section>

    <FeaturedStories variant="home" />

    <section className="homepage-contact-section" id="partner-with-tap">
      <div className="homepage-contact-panel">
        <div className="homepage-contact-column"><p className="eyebrow">PARTNER WITH TAP</p><h2>Put your brand where Africa’s deals are discussed.</h2><p>Brand partnerships, events and content collaborations.</p><PartnershipTrigger className="button button-pink">EXPLORE PARTNERSHIPS <span>→</span></PartnershipTrigger></div>
        <div className="homepage-contact-divider" aria-hidden="true" />
        <div className="homepage-contact-column" id="contact"><p className="eyebrow">CONTACT</p><h2>Start a conversation.</h2><p>For general enquiries, questions or partnership proposals, contact the team.</p><Link className="button button-outline" href="/contact">CONTACT THE AFRICA PLUG <span>→</span></Link><a className="homepage-contact-email" href={`mailto:${contactEmail}`}>{contactEmail}</a></div>
      </div>
    </section>

    {showNewsletter ? <NewsletterSignup /> : null}
  </>;
}
