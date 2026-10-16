const FOOTER_LINKS = [
  { label: "TAP IN", href: "/tap-in" },
  { label: "Work With FK", href: "/work-with-fk" },
  { label: "Store", href: "/store" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "About", href: "/about" },
];
const FOOTER_LEGAL = [
  { label: "Privacy", href: "/privacy" },
  { label: "Cookies", href: "/cookies" },
  { label: "Terms", href: "/terms" },
  { label: "Refunds", href: "/refunds" },
];
function FooterBrand() {
  return <a href="/#top" aria-label="The Africa Plug — go to homepage top" className="footer-logo-lockup"><img src="/images/logo-mark.svg" alt="" aria-hidden="true" className="footer-logo-mark"/><span className="footer-wordmark" aria-hidden="true"><span className="footer-wordmark-the">THE</span><span className="footer-wordmark-name"><span>AFRICA</span><b>PLUG</b></span></span></a>;
}
export default function Footer() {
  return <footer className="site-footer">
    <div className="footer-accent" aria-hidden="true"/>
    <div className="tap-footer-grid">
      <div className="tap-footer-brand"><FooterBrand/><p className="tap-footer-tagline">Your connection to Africa.</p><a className="tap-footer-email" href="mailto:connect@theafricaplug.com">connect@theafricaplug.com</a></div>
      <nav className="tap-footer-column" aria-label="Explore links"><h2>EXPLORE</h2>{FOOTER_LINKS.map((item)=><a key={item.href} href={item.href}>{item.label}</a>)}</nav>
      <div className="tap-footer-contact"><p className="tap-footer-kicker">THE AFRICA PLUG</p><p className="tap-footer-description">Investment • Business • Entertainment</p><a className="tap-footer-primary-link" href="/contact">Start a conversation <span aria-hidden="true" className="footer-arrow">→</span></a><p className="tap-footer-contact-note">For general, business and partnership enquiries, write to <a href="mailto:connect@theafricaplug.com">connect@theafricaplug.com</a>.</p></div>
    </div>
    <div className="tap-footer-bottom"><p className="tap-footer-copyright">© {new Date().getFullYear()} The Africa Plug. All rights reserved.</p><p className="tap-footer-motto">INVESTMENT • BUSINESS • ENTERTAINMENT</p><nav aria-label="Legal information">{FOOTER_LEGAL.map((item)=><a key={item.href} href={item.href}>{item.label}</a>)}</nav></div>
  </footer>;
}
