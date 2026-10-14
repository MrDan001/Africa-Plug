import FeaturedStories from "@/components/blog/FeaturedStories";

const photos = {
  fk: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=85",
  excavator: "https://images.unsplash.com/photo-1580901368919-7738efb0f87e?auto=format&fit=crop&w=1200&q=85",
  honey: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=900&q=85",
  solar: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=85",
  farm: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85",
  people: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1800&q=85",
  city: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=850&q=85",
  network: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=850&q=85",
};

function Arrow() {
  return <span className="arrow-mark" aria-hidden="true">↗</span>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export default function HomeSections() {
  return (
    <>
      <section className="intro-section section-grid" id="about">
        <a className="video-poster" href="#work-with-fk" aria-label="Meet FK and explore commercial consultancy">
          <div className="poster-image" role="img" aria-label="Podcast microphone in a dark recording studio" style={{ backgroundImage: `linear-gradient(180deg,rgba(4,5,9,.05),rgba(4,5,9,.38)),url("${photos.fk}")` }} />
          <span className="play-button" aria-hidden="true">▶</span>
          <span className="video-tag">MEET FK <i>•</i> INTRODUCTION</span>
          <span className="video-duration">VIDEO INTRODUCTION <b>↗</b></span>
        </a>
        <div className="intro-copy">
          <Eyebrow>MEET FK</Eyebrow>
          <h2>A FEW WORDS<br />ABOUT THE AFRICA PLUG</h2>
          <p>I’m FK. I built Africa Plug to connect real people with real opportunities — across business, investment, partnerships and more. This isn’t just about opportunity; it’s about people, progress and a bigger Africa.</p>
          <a className="text-link" href="#work-with-fk">EXPLORE THE STORY <span>→</span></a>
        </div>
      </section>

      <section className="work-section content-section" id="work-with-fk">
        <div className="work-intro">
          <Eyebrow>COMMERCIAL DEAL CONSULTANCY</Eyebrow>
          <h2>WORK WITH FK</h2>
          <p>Get expert support to access, structure and close the right opportunities in Africa.</p>
          <a className="button button-pink" href="#contact">START YOUR APPLICATION <span>→</span></a>
          <a className="text-link" href="#process">SEE HOW IT WORKS</a>
        </div>
        <div className="proof-area" id="process">
          <div className="proof-label"><span className="line-icon">↗</span><div><b>THE PROCESS</b><small>Simple. Clear. Focused.</small></div></div>
          <div className="proof-label"><span className="line-icon">◇</span><div><b>SELECTED WORK</b><small>Real deals. Real impact.</small></div></div>
          <div className="proof-label"><span className="line-icon">“</span><div><b>TESTIMONIALS</b><small>What our clients say.</small></div></div>
          <article className="proof-card">
            <div className="card-photo" role="img" aria-label="Excavator on a construction site" style={{ backgroundImage: `url("${photos.excavator}")` }} />
            <div className="proof-card-caption">Equipment Hire<br /><strong>Africa</strong></div>
          </article>
          <article className="proof-card">
            <div className="card-photo" role="img" aria-label="Honey ready for supply" style={{ backgroundImage: `url("${photos.honey}")` }} />
            <div className="proof-card-caption">Honey Supply<br /><strong>Partnerships</strong></div>
          </article>
          <article className="testimonial-card">
            <span className="quote-mark">“</span>
            <p>Working with FK gave us access to opportunities we couldn’t have found on our own.</p>
            <small>— Client success story</small>
          </article>
        </div>
      </section>

      <section className="tap-section" id="tap-in">
        <div className="tap-image" role="img" aria-label="Heavy equipment on a construction site at sunset" style={{ backgroundImage: `url("${photos.excavator}")` }} />
        <div className="tap-intro">
          <Eyebrow>LIVE OPPORTUNITIES</Eyebrow>
          <h2>TAP IN</h2>
          <p>Discover vetted business and investment opportunities across Africa. From agriculture to infrastructure, energy to tech.</p>
          <a className="button button-pink" href="#tap-in">VIEW LATEST LISTINGS <span>→</span></a>
        </div>
        <div className="listing-stack">
          <a className="listing-row" href="#contact">
            <span className="listing-thumb" style={{ backgroundImage: `url("${photos.excavator}")` }} />
            <span className="listing-info"><b>Excavator Hire — Lagos</b><small>Construction <i>•</i> Equipment</small></span><Arrow />
          </a>
          <a className="listing-row" href="#contact">
            <span className="listing-thumb" style={{ backgroundImage: `url("${photos.honey}")` }} />
            <span className="listing-info"><b>Honey Supply — Plateau</b><small>Agriculture <i>•</i> Export</small></span><Arrow />
          </a>
          <a className="listing-row" href="#contact">
            <span className="listing-thumb" style={{ backgroundImage: `url("${photos.solar}")` }} />
            <span className="listing-info"><b>Solar Energy Project — Kenya</b><small>Energy <i>•</i> Investment</small></span><Arrow />
          </a>
        </div>
      </section>

      <section className="product-section" id="store">
        <div className="product-art" aria-label="Africa Starter Guide product preview">
          <div className="guide-book">
            <span className="guide-title">THE AFRICA<br />STARTER GUIDE</span>
            <svg className="africa-outline" viewBox="0 0 100 112" role="img" aria-label="Outline illustration of Africa">
              <path d="M42 5 57 8 63 18 78 20 81 31 94 35 83 48 76 52 78 64 70 76 61 82 55 99 47 106 40 91 33 78 26 65 25 52 14 42 17 30 29 24 33 13Z" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinejoin="round" />
              <path d="M81 82 88 85 86 99 80 106 77 96Z" fill="none" stroke="currentColor" strokeWidth="2.3" />
            </svg>
            <span className="guide-foot">YOUR STEP-BY-STEP GUIDE<br />TO OPPORTUNITY IN AFRICA</span>
          </div>
          <div className="guide-phone"><div className="phone-speaker" /><b>THE AFRICA<br />STARTER GUIDE</b><span className="phone-map">✦</span></div>
        </div>
        <div className="product-copy">
          <Eyebrow>FEATURED PRODUCT</Eyebrow>
          <h2>THE AFRICA STARTER GUIDE</h2>
          <p>A practical guide to help you understand the landscape, find real opportunities and take the right steps.</p>
          <strong className="product-price">COMING SOON</strong>
          <a className="button button-pink" href="#contact">GET PRODUCT UPDATES <span>→</span></a>
        </div>
      </section>

      <section className="partner-banner" id="partner" style={{ backgroundImage: `linear-gradient(90deg,rgba(2,4,8,.98) 0%,rgba(2,4,8,.91) 30%,rgba(2,4,8,.36) 100%),url("${photos.people}")` }}>
        <div className="partner-copy">
          <Eyebrow>PARTNER WITH TAP</Eyebrow>
          <h2>LET’S BUILD<br />TOGETHER</h2>
          <p>We work with forward-thinking brands, sponsors, events and guests who want to be part of Africa’s next chapter.</p>
          <a className="button button-pink" href="#contact">PARTNER WITH TAP <span>→</span></a>
        </div>
      </section>

      <FeaturedStories variant="home" />

      <section className="closing-section" id="contact">
        <Eyebrow>STAY CONNECTED</Eyebrow>
        <h2>LET’S STAY PLUGGED IN</h2>
        <p>Have a question, a business idea or want to know more?<br className="desktop-only" /> We’re here to help.</p>
        <div className="closing-cards">
          <a href="#contact" className="closing-card"><span className="closing-icon">✉</span><b>CONTACT</b><small>Get in touch with our team.</small><Arrow /></a>
          <a href="#contact" className="closing-card"><span className="closing-icon">＋</span><b>ASK THE AFRICA PLUG</b><small>Questions, advice, guidance.</small><Arrow /></a>
          <a href="#contact" className="closing-card"><span className="closing-icon">♧</span><b>STAY PLUGGED IN</b><small>Join our mailing list.</small><Arrow /></a>
        </div>
      </section>
    </>
  );
}
