const FOOTER_EXPLORE = [
  { label: "TAP IN", href: "/tap-in" },
  { label: "STORE", href: "/store" },
  { label: "BLOG", href: "/blog" },
  { label: "ABOUT", href: "/about" },
];

const FOOTER_ENGAGE = [
  { label: "WORK WITH FK", href: "/work-with-fk" },
  { label: "PARTNER WITH TAP", href: "/#partner" },
  { label: "ASK THE AFRICA PLUG", href: "/#contact" },
  { label: "CONTACT", href: "/contact" },
];

const FOOTER_LEGAL = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
  { label: "Deposit & Refund Terms", href: "/deposit-refund-terms" },
];

function FooterBrand() {
  return (
    <a href="/#top" aria-label="The Africa Plug — back to top" className="footer-logo-lockup">
      {/* Use the supplied brand mark; the name remains THE AFRICA PLUG. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo-mark.svg" alt="" aria-hidden="true" className="footer-logo-mark" />
      <span className="footer-wordmark" aria-hidden="true">
        <span className="footer-wordmark-the">THE</span>
        <span className="footer-wordmark-name"><span>AFRICA</span><b>PLUG</b></span>
      </span>
    </a>
  );
}

function Arrow() {
  return <span aria-hidden="true" className="footer-arrow">↗</span>;
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-accent" aria-hidden="true" />

      <div className="tap-footer-grid">
        <div className="tap-footer-brand">
          <FooterBrand />
          <p className="tap-footer-tagline">Your connection to Africa.</p>
          <p className="tap-footer-description">
            Business, investment and partnerships — connected with purpose across the continent.
          </p>
          <a className="tap-footer-primary-link" href="/work-with-fk">
            WORK WITH FK <Arrow />
          </a>
        </div>

        <nav className="tap-footer-column" aria-label="Explore links">
          <h2>EXPLORE</h2>
          {FOOTER_EXPLORE.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>

        <nav className="tap-footer-column" aria-label="Ways to engage">
          <h2>GET INVOLVED</h2>
          {FOOTER_ENGAGE.map((item) => (
            <a key={item.label} href={item.href}>{item.label}</a>
          ))}
        </nav>

        <div className="tap-footer-contact">
          <p className="tap-footer-kicker">LET’S TALK</p>
          <h2>Have an opportunity in mind?</h2>
          <p>Tell us what you’re working on. We’ll help you find the right next step.</p>
          <a className="tap-footer-contact-row" href="mailto:connect@theafricaplug.com">
            <span><small>OFFICIAL EMAIL · ALL ENQUIRIES</small><b>connect@theafricaplug.com</b></span>
            <Arrow />
          </a>
        </div>
      </div>

      <div className="tap-footer-bottom">
        <p>© {new Date().getFullYear()} The Africa Plug. All rights reserved.</p>
        <p className="tap-footer-motto">KNOW WHAT’S MOVING.</p>
        <nav aria-label="Legal information">
          {FOOTER_LEGAL.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
