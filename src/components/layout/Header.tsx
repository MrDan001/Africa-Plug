"use client";

import Link from "next/link";
import MobileMenu from "./MobileMenu";
import SiteSearch from "./SiteSearch";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "TAP IN", href: "/tap-in" },
  { label: "WORK WITH FK", href: "/work-with-fk" },
  { label: "STORE", href: "/store" },
  { label: "BLOG", href: "/blog" },
  { label: "CONTACT", href: "/contact" },
  { label: "ABOUT", href: "/about" },
];

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" aria-label="The Africa Plug — go to homepage" className="brand-lockup">
          {/* Exact supplied logo mark, paired with a readable wordmark for mobile. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-mark.svg" alt="" aria-hidden="true" className="brand-logo" />
          <span className="brand-wordmark" aria-hidden="true">
            <span className="brand-the">THE</span>
            <span className="brand-name"><span className="brand-africa">AFRICA</span><span className="brand-plug">PLUG</span></span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="desktop-nav">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>

        <div className="header-actions">
          <a href="/work-with-fk" className="button button-pink header-cta">WORK WITH FK</a>
          <SiteSearch />
          <div className="mobile-menu-wrap">
            <MobileMenu items={NAV_ITEMS} />
          </div>
        </div>
      </div>
    </header>
  );
}
