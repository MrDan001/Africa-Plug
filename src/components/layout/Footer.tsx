// FILE PATH: src/components/layout/Footer.tsx
import Link from "next/link";
import { getPublicSiteSettings } from "@/lib/cms-bridge";
import BrandLogo from "@/components/layout/BrandLogo";
import CookieSettingsLink from "@/components/layout/CookieSettingsLink";
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

function WhatsAppIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="tap-social-icon"><path fill="currentColor" d="M20.52 3.48A11.82 11.82 0 0 0 12.08 0C5.54 0 .22 5.32.22 11.86c0 2.09.55 4.13 1.59 5.93L.12 24l6.36-1.67a11.84 11.84 0 0 0 5.6 1.42h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.23-6.14-3.43-8.41ZM12.09 21.72h-.01a9.83 9.83 0 0 1-5.01-1.37l-.36-.21-3.77.99 1.01-3.68-.23-.38a9.82 9.82 0 1 1 8.37 4.65Zm5.39-7.37c-.29-.15-1.71-.84-1.98-.94-.27-.1-.46-.15-.65.15-.19.29-.75.94-.92 1.13-.17.19-.34.22-.63.07-.29-.15-1.23-.45-2.34-1.45-.86-.77-1.45-1.72-1.62-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.65-1.57-.89-2.15-.23-.56-.47-.48-.65-.49h-.55c-.19 0-.5.07-.77.36-.27.29-1.04 1.01-1.04 2.46s1.06 2.86 1.2 3.05c.15.19 2.09 3.2 5.06 4.49.71.31 1.27.49 1.7.63.71.23 1.35.2 1.86.12.57-.08 1.71-.7 1.95-1.38.24-.68.24-1.26.17-1.38-.07-.12-.27-.19-.56-.34Z"/></svg>;
}

function LinkedInIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="tap-social-icon"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.66H9.34V8.99h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.3ZM5.32 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM3.54 20.45h3.57V8.99H3.54v11.46ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46C23.21 24 24 23.23 24 22.27V1.73C24 .77 23.21 0 22.23 0Z"/></svg>;
}

export default async function Footer() {
  const settings = await getPublicSiteSettings();
  const contactEmail = settings.contactEmail || "connect@theafricaplug.com";
  const exploreLinks = settings.navigation?.length ? settings.navigation : FOOTER_LINKS;
  const socialLinks = [
    settings.whatsappUrl ? { label: "WhatsApp", href: settings.whatsappUrl, icon: <WhatsAppIcon /> } : null,
    settings.linkedinUrl ? { label: "LinkedIn", href: settings.linkedinUrl, icon: <LinkedInIcon /> } : null,
    settings.instagramUrl ? { label: "Instagram", href: settings.instagramUrl, icon: null } : null,
  ].filter((item): item is Exclude<typeof item, null> => item !== null && /^https:\/\//i.test(item.href));

  return <footer className="site-footer">
    <div className="footer-accent" aria-hidden="true"/>
    <div className="tap-footer-grid">
      <div className="tap-footer-brand"><FooterBrand/><p className="tap-footer-tagline">Your connection to Africa.</p><a className="tap-footer-email" href={`mailto:${contactEmail}`}>{contactEmail}</a></div>
      <nav className="tap-footer-column" aria-label="Explore links"><h2>EXPLORE</h2>{exploreLinks.map((item)=><a key={item.href} href={item.href}>{item.label}</a>)}</nav>
      <div className="tap-footer-contact"><p className="tap-footer-kicker">THE AFRICA PLUG</p><p className="tap-footer-description">Investment • Business • Entertainment</p><p className="tap-footer-contact-note">For general, business and partnership enquiries, write to <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.</p>{socialLinks.length ? <nav className="tap-footer-socials" aria-label="Social links">{socialLinks.map((item) => <a key={item.label} className="tap-footer-social" href={item.href} target="_blank" rel="noreferrer" aria-label={item.label} title={item.label}>{item.icon}<span>{item.label}</span></a>)}</nav> : null}</div>
    </div>
    <div className="tap-footer-bottom"><p className="tap-footer-copyright">© {new Date().getFullYear()} The Africa Plug. All rights reserved.</p><p className="tap-footer-motto">INVESTMENT • BUSINESS • ENTERTAINMENT</p><nav aria-label="Legal information">{FOOTER_LEGAL.map((item)=><a key={item.href} href={item.href}>{item.label}</a>)}<CookieSettingsLink /></nav></div>
  </footer>;
}
