const FOOTER_EXPLORE = [
  { label: "Discover", href: "/#discover" },
  { label: "Understand", href: "/#understand" },
  { label: "Access", href: "/#access" },
  { label: "Media", href: "/blog" },
  { label: "Store", href: "/store" },
];

const FOOTER_COMPANY = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Ask The Africa Plug", href: "/contact" },
  { label: "Work With FK", href: "/work-with-fk" },
];

const FOOTER_LEGAL = [
  { label: "Privacy", href: "/privacy" },
  { label: "Cookies", href: "/cookies" },
  { label: "Terms", href: "/terms" },
  { label: "Refunds", href: "/refunds" },
];

function FooterBrand() {
  return (
    <a href="/" aria-label="The Africa Plug — go to homepage" className="footer-logo-lockup">
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
  return <span aria-hidden="true" className="footer-arrow">→</span>;
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-accent" aria-hidden="true" />
      <div className="tap-footer-grid">
        <div className="tap-footer-brand">
          <FooterBrand />
          <p className="tap-footer-tagline">Your connection to Africa.</p>
          <a className="tap-footer-email" href="mailto:connect@theafricaplug.com">connect@theafricaplug.com</a>
        </div>

        <nav className="tap-footer-column" aria-label="Explore links">
          <h2>EXPLORE</h2>
          {FOOTER_EXPLORE.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>

        <nav className="tap-footer-column" aria-label="Company links">
          <h2>COMPANY</h2>
          {FOOTER_COMPANY.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>

        <div className="tap-footer-contact">
          <p className="tap-footer-kicker">THE AFRICA PLUG</p>
          <p className="tap-footer-description">Business. Investment. Culture. Travel. Lifestyle. Opportunity.</p>
          <a className="tap-footer-primary-link" href="/#discover">
            Start exploring <Arrow />
          </a>
          <p className="tap-footer-contact-note">Have a question or a commercial opportunity? Write to <a href="mailto:connect@theafricaplug.com">connect@theafricaplug.com</a>.</p>
        </div>
      </div>

      <div className="tap-footer-bottom">
        <p className="tap-footer-copyright">© {new Date().getFullYear()} The Africa Plug. All rights reserved.</p>
        <p className="tap-footer-motto">KNOW AFRICA. &nbsp; ACCESS AFRICA. &nbsp; EXPERIENCE AFRICA.</p>
        <nav aria-label="Legal information">
          {FOOTER_LEGAL.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
      </div>
    </footer>
  );
}
