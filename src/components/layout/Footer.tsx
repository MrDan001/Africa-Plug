const FOOTER_LINKS = [
  { label: "TAP IN", href: "#tap-in" },
  { label: "WORK WITH FK", href: "#work-with-fk" },
  { label: "STORE", href: "#store" },
  { label: "BLOG", href: "#blog" },
  { label: "CONTACT", href: "#contact" },
  { label: "ABOUT", href: "#about" },
];

const LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
  { label: "Deposit & Refund Terms", href: "/deposit-refund-terms" },
];

function SocialIcon({ type }: { type: "linkedin" | "youtube" | "instagram" }) {
  if (type === "linkedin") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8.5H2V22h3V8.5ZM3.5 2A1.8 1.8 0 1 0 3.5 5.6 1.8 1.8 0 0 0 3.5 2ZM22 14c0-4-2.1-5.9-4.9-5.9a4.2 4.2 0 0 0-3.8 2.1V8.5h-3V22h3v-7.1c0-1.9.4-3.7 2.7-3.7s2.4 2.1 2.4 3.8V22h3.1l.5-8Z" fill="currentColor" /></svg>;
  }
  if (type === "youtube") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.3 6.2a3 3 0 0 0-2.1-2.1C19.4 3.6 12 3.6 12 3.6s-7.4 0-9.2.5A3 3 0 0 0 .7 6.2 31 31 0 0 0 .2 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.5 9.2.5 9.2.5s7.4 0 9.2-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-5.8 31 31 0 0 0-.5-5.8ZM9.6 15.8V8.2l6.3 3.8-6.3 3.8Z" fill="currentColor" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="18" cy="6.5" r="1.2" fill="currentColor" /></svg>;
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <a href="#top" aria-label="Africa Plug — back to top" className="footer-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.svg" alt="The Africa Plug" />
        </a>
        <nav className="footer-nav" aria-label="Footer navigation">
          {FOOTER_LINKS.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
        <div className="social-links" aria-label="Social media">
          <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><SocialIcon type="linkedin" /></a>
          <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label="YouTube"><SocialIcon type="youtube" /></a>
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram"><SocialIcon type="instagram" /></a>
        </div>
      </div>
      <div className="footer-bottom">
        <nav aria-label="Legal links">
          {LEGAL_LINKS.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
        <p>© {new Date().getFullYear()} Africa Plug. All rights reserved.</p>
      </div>
    </footer>
  );
}
