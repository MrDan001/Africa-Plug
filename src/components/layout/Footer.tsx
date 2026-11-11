// FILE PATH: src/components/layout/Footer.tsx
import Link from "next/link";
import { getPublicSiteSettings } from "@/lib/cms-bridge";
import BrandLogo from "@/components/layout/BrandLogo";
import CookieSettingsLink from "@/components/layout/CookieSettingsLink";
import "./site-chrome.css";

const FOOTER_LINKS = [
  { label: "T.A.P IN", href: "/tap-in" },
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

function InstagramIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="tap-social-icon"><path fill="currentColor" d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2Zm0 2A3.2 3.2 0 0 0 4 7.2v9.6A3.2 3.2 0 0 0 7.2 20h9.6a3.2 3.2 0 0 0 3.2-3.2V7.2A3.2 3.2 0 0 0 16.8 4H7.2Zm4.8 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-3.35a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z"/></svg>;
}

function YouTubeIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="tap-social-icon"><path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.12C19.55 3.56 12 3.56 12 3.56s-7.55 0-9.4.52A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.12c1.85.52 9.4.52 9.4.52s7.55 0 9.4-.52a3 3 0 0 0 2.1-2.12A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8ZM9.55 15.6V8.4L15.8 12l-6.25 3.6Z"/></svg>;
}

function TikTokIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="tap-social-icon"><path fill="currentColor" d="M19.6 6.2a5.5 5.5 0 0 1-3.4-4.9V1h-4.1v14.1a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V8.1a7 7 0 1 0 6.1 6.9V8a9.6 9.6 0 0 0 5.6 1.8V5.7c-.8 0-1.5-.2-2.2-.5Z"/></svg>;
}

function FacebookIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="tap-social-icon"><path fill="currentColor" d="M13.5 22v-9h3l.45-3.5H13.5V7.25c0-1.02.28-1.72 1.75-1.72h1.86V2.4A24 24 0 0 0 14.4 2c-2.7 0-4.55 1.65-4.55 4.7v2.8H6.8V13h3.05v9h3.65Z"/></svg>;
}

export default async function Footer() {
  const settings = await getPublicSiteSettings();
  const contactEmail = settings.contactEmail || "connect@theafricaplug.com";
  const configuredExploreLinks = settings.navigation?.length ? settings.navigation : FOOTER_LINKS;
  // Keep the Work With FK destination visible even when CMS navigation settings omit it.
  const exploreLinks = configuredExploreLinks.some((item) => item.href === "/work-with-fk")
    ? configuredExploreLinks
    : [
        ...configuredExploreLinks.slice(0, 1),
        { label: "WORK WITH FK", href: "/work-with-fk" },
        ...configuredExploreLinks.slice(1),
      ];
  const socialLinks = [
    { label: "LinkedIn", href: settings.linkedinUrl ?? "", icon: <LinkedInIcon />, className: "is-linkedin" },
    { label: "Instagram", href: settings.instagramUrl ?? "", icon: <InstagramIcon />, className: "is-instagram" },
    { label: "YouTube", href: settings.footerYoutubeUrl ?? "", icon: <YouTubeIcon />, className: "is-youtube" },
    { label: "TikTok", href: settings.tiktokUrl ?? "", icon: <TikTokIcon />, className: "is-tiktok" },
    { label: "Facebook", href: settings.facebookUrl ?? "", icon: <FacebookIcon />, className: "is-facebook" },
    { label: "WhatsApp", href: settings.whatsappUrl ?? "", icon: <WhatsAppIcon />, className: "is-whatsapp" },
  ].filter((item) => /^https:\/\//i.test(item.href));

  return <footer className="site-footer">
    <section className="tap-whatsapp-channel" aria-labelledby="tap-whatsapp-channel-title">
      <div className="tap-whatsapp-channel-copy">
        <span className="tap-whatsapp-channel-icon" aria-hidden="true"><WhatsAppIcon /></span>
        <div className="tap-whatsapp-channel-text">
          <h2 id="tap-whatsapp-channel-title">STAY CONNECTED WITH THE AFRICA PLUG</h2>
          <p>Get the latest updates, opportunities, announcements and community news.</p>
        </div>
      </div>
      <a
        className="tap-whatsapp-channel-link"
        href="https://whatsapp.com/channel/0029VbEDkUb42DcZQM6mub1a"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join the Africa Plug WhatsApp Channel"
      >
        <WhatsAppIcon />
        <span>Join Our WhatsApp Channel</span>
        <span className="tap-whatsapp-channel-arrow" aria-hidden="true">→</span>
      </a>
    </section>
    <div className="tap-footer-grid">
      <div className="tap-footer-brand"><FooterBrand/><p className="tap-footer-tagline">Your connection to Africa.</p></div>
      <nav className="tap-footer-column" aria-label="Explore links"><h2>EXPLORE</h2>{exploreLinks.map((item)=><a key={item.href} href={item.href}>{item.label}</a>)}</nav>
      <div className="tap-footer-contact"><p className="tap-footer-kicker">THE AFRICA PLUG</p><p className="tap-footer-description"></p><p className="tap-footer-contact-note">For general, business and partnership enquiries, write to <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.</p>{socialLinks.length ? <nav className="tap-footer-socials" aria-label="Social links">{socialLinks.map((item) => <a key={item.label} className={`tap-footer-social ${item.className}`} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.label} title={item.label}>{item.icon}<span>{item.label}</span></a>)}</nav> : null}</div>
    </div>
    <div className="tap-footer-bottom"><p className="tap-footer-copyright">© {new Date().getFullYear()} The Africa Plug. All rights reserved.</p><p className="tap-footer-motto">INVESTMENT • BUSINESS • ENTERTAINMENT</p><nav aria-label="Legal information">{FOOTER_LEGAL.map((item)=><a key={item.href} href={item.href}>{item.label}</a>)}<CookieSettingsLink /></nav></div>
  </footer>;
}