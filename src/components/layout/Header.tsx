"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileMenu from "./MobileMenu";
import SiteSearch from "./SiteSearch";
import StoreCartButton from "@/components/store/StoreCartButton";

const NAV_ITEMS = [
  { label: "TAP IN", href: "/tap-in" },
  { label: "WORK WITH FK", href: "/work-with-fk" },
  { label: "STORE", href: "/store" },
  { label: "BLOG", href: "/blog" },
  { label: "CONTACT", href: "/contact" },
  { label: "ABOUT", href: "/about" },
];

export default function Header() {
  const pathname = usePathname();
  const isStoreExperience = pathname === "/store" || pathname.startsWith("/store/");
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/#top" aria-label="The Africa Plug — go to top of homepage" className="brand-lockup">
          <img src="/images/logo-mark.svg" alt="" aria-hidden="true" className="brand-logo" />
          <span className="brand-wordmark" aria-hidden="true"><span className="brand-the">THE</span><span className="brand-name"><span className="brand-africa">AFRICA</span><span className="brand-plug">PLUG</span></span></span>
        </Link>
        <nav aria-label="Main navigation" className="desktop-nav">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return <Link key={item.href} href={item.href} className={active ? "is-active" : undefined} aria-current={active ? "page" : undefined}>{item.label}</Link>;
          })}
        </nav>
        <div className="header-actions">
          {!isStoreExperience ? <Link href="/work-with-fk" className="button button-pink header-cta">WORK WITH FK</Link> : null}
          <SiteSearch />
          {isStoreExperience ? <StoreCartButton /> : null}
          <div className="mobile-menu-wrap"><MobileMenu items={NAV_ITEMS} /></div>
        </div>
      </div>
    </header>
  );
}
