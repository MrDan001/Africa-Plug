// FILE PATH: src/components/layout/Footer.tsx
import Link from "next/link";
import { getPublicSiteSettings } from "@/lib/cms-bridge";
import BrandLogo from "@/components/layout/BrandLogo";
import "./site-chrome.css";

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
  return <Link href="/#top" aria-label="The Africa Plug — go to homepage top" className="footer-logo-lockup"><BrandLogo className="tap-brand-logo--footer" /></Link>;
}
export default async function Footer() {
  const settings = await getPublicSiteSettings();
  const contactEmail = settings.contactEmail || "connect@theafricaplug.com";
  const exploreLinks = settings.navigation?.length ? settings.navigation : FOOTER_LINKS;
  const socialLinks = [
    settings.whatsappUrl ? { label: "WhatsApp", href: settings.whatsappUrl } : null,
    settings.linkedinUrl ? { label: "LinkedIn", href: settings.linkedinUrl } : null,
    settings.instagramUrl ? { label: "Instagram", href: settings.instagramUrl } : null,
  ].filter((item): item is { label: string; href: string } => item !== null && /^https:\/\//i.test(item.href));
  return <footer className="site-footer">
    <div className="footer-accent" aria-hidden="true"/>
    <div className="tap-footer-grid">
      <div className="tap-footer-brand"><FooterBrand/><p className="tap-footer-tagline">Your connection to Africa.</p><a className="tap-footer-email" href={`mailto:${contactEmail}`}>{contactEmail}</a></div>
      <nav className="tap-footer-column" aria-label="Explore links"><h2>EXPLORE</h2>{exploreLinks.map((item)=><a key={item.href} href={item.href}>{item.label}</a>)}</nav>
      <div className="tap-footer-contact"><p className="tap-footer-kicker">THE AFRICA PLUG</p><p className="tap-footer-description">Investment • Business • Entertainment</p><p className="tap-footer-contact-note">For general, business and partnership enquiries, write to <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.</p>{socialLinks.length ? <nav aria-label="Social links" style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 16 }}>{socialLinks.map((item) => <a key={item.label} href={item.href} target="_blank" rel="noreferrer">{item.label} ↗</a>)}</nav> : null}</div>
    </div>
    <div className="tap-footer-bottom"><p className="tap-footer-copyright">© {new Date().getFullYear()} The Africa Plug. All rights reserved.</p><p className="tap-footer-motto">INVESTMENT • BUSINESS • ENTERTAINMENT</p><nav aria-label="Legal information">{FOOTER_LEGAL.map((item)=><a key={item.href} href={item.href}>{item.label}</a>)}</nav></div>
  </footer>;
}