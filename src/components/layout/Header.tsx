"use client";

import Link from "next/link";
import MobileMenu from "./MobileMenu";

const NAV_ITEMS = [
  { label: "TAP IN", href: "#tap-in" },
  { label: "WORK WITH FK", href: "#work-with-fk" },
  { label: "STORE", href: "#store" },
  { label: "BLOG", href: "#blog" },
  { label: "CONTACT", href: "#contact" },
  { label: "ABOUT", href: "#about" },
];

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
    </svg>
  );
}

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="#top" aria-label="Africa Plug — top of page" className="brand-lockup">
          {/* Exact supplied brand asset; not redrawn or re-typeset. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.svg" alt="The Africa Plug" className="brand-logo" />
        </Link>

        <nav aria-label="Main navigation" className="desktop-nav">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>

        <div className="header-actions">
          <a href="#work-with-fk" className="button button-pink header-cta">WORK WITH FK</a>
          <div className="mobile-menu-wrap">
            <MobileMenu items={NAV_ITEMS} />
          </div>
          <a href="#tap-in" className="search-button" aria-label="Explore live opportunities">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.3 4.3" strokeLinecap="round" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
