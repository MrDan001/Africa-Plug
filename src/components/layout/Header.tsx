// FILE PATH: src/components/layout/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import MobileMenu from "./MobileMenu";
import SiteSearch from "./SiteSearch";
import BrandLogo from "@/components/layout/BrandLogo";
import "./site-chrome.css";

const NAV_ITEMS = [
  { label: "TAP IN", href: "/tap-in" },
  { label: "STORE", href: "/store" },
  { label: "BLOG", href: "/blog" },
  { label: "CONTACT", href: "/contact" },
  { label: "ABOUT", href: "/about" },
];

export default function Header() {
  const pathname = usePathname();
  const [navigationItems, setNavigationItems] = useState(NAV_ITEMS);
  const [enableSearch, setEnableSearch] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/site-settings/public", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const settings = await response.json() as { navigation?: unknown; enableSearch?: unknown };
        if (!active) return;
        if (Array.isArray(settings.navigation)) {
          const safeItems = settings.navigation.filter((item): item is { label: string; href: string } =>
            Boolean(item) && typeof item === "object" &&
            typeof (item as { label?: unknown }).label === "string" &&
            typeof (item as { href?: unknown }).href === "string" &&
            (item as { href: string }).href.startsWith("/") &&
            !(item as { href: string }).href.startsWith("//") &&
            !(item as { href: string }).href.startsWith("/admin") &&
            !(item as { href: string }).href.startsWith("/api")
          );
          if (safeItems.length) setNavigationItems(safeItems.slice(0, 12));
        }
        if (typeof settings.enableSearch === "boolean") setEnableSearch(settings.enableSearch);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/#top" aria-label="The Africa Plug — go to top of homepage" className="brand-lockup">
          <BrandLogo className="tap-brand-logo--header" />
        </Link>
        <nav aria-label="Main navigation" className="desktop-nav">
          {navigationItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return <Link key={item.href} href={item.href} className={active ? "is-active" : undefined} aria-current={active ? "page" : undefined}>{item.label}</Link>;
          })}
        </nav>
        <div className="header-actions">
          <Link href="/work-with-fk" className="button button-pink header-cta">WORK WITH FK</Link>
          {enableSearch ? <SiteSearch /> : null}
          <div className="mobile-menu-wrap"><MobileMenu items={navigationItems} /></div>
        </div>
      </div>
    </header>
  );
}