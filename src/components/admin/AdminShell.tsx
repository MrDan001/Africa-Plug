// FILE PATH: src/components/admin/AdminShell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import "./AdminDashboard.css";
import "./AdminPages.css";
import "./AdminTapIn.css";
import "./AdminHomepage.css";

/* ---------- Module registry: single source for desktop sidebar + mobile "More" sheet ---------- */
export type IconName =
  | "dashboard" | "home" | "tapin" | "blog" | "store" | "fk" | "review" | "enquiries"
  | "subscribers" | "analytics" | "media" | "commercial" | "settings" | "more" | "globe";

type NavItem = { title: string; href: string; icon: IconName; detail: string; badgeKey?: "tapin" | "review" | "enquiries" };
type NavGroup = { label: string | null; items: NavItem[] };

export const ADMIN_NAV: NavGroup[] = [
  { label: null, items: [
    { title: "Dashboard", href: "/admin", icon: "dashboard", detail: "Overview of everything" },
    { title: "Homepage", href: "/admin/homepage", icon: "home", detail: "Hero slides, imagery and video" },
    { title: "TAP IN", href: "/admin/tap-in", icon: "tapin", detail: "Create, review and publish listings", badgeKey: "tapin" },
    { title: "Blog & Editorial", href: "/admin/blog", icon: "blog", detail: "Articles, categories and SEO" },
    { title: "Store Products", href: "/admin/store", icon: "store", detail: "Products, prices and files" },
    { title: "Store Orders", href: "/admin/store-orders", icon: "commercial", detail: "Orders, payments and delivery" },
  ]},
  { label: "BUSINESS OPERATIONS", items: [
    { title: "Work With FK", href: "/admin/work-with-fk", icon: "fk", detail: "Applications and decisions" },
    { title: "Review Required", href: "/admin/review-required", icon: "review", detail: "Applications awaiting a decision", badgeKey: "review" },
    { title: "Enquiries & Forms", href: "/admin/enquiries", icon: "enquiries", detail: "Contact, partner and Ask TAP inbox", badgeKey: "enquiries" },
    { title: "Subscribers", href: "/admin/subscribers", icon: "subscribers", detail: "Stay Plugged In audience" },
    { title: "Analytics & Funnel", href: "/admin/analytics", icon: "analytics", detail: "Sources, UTM and conversions" },
  ]},
  { label: "SITE CONTROL", items: [
    { title: "Media Library", href: "/admin/media", icon: "media", detail: "Reusable images and documents" },
    { title: "Commercial Settings", href: "/admin/settings", icon: "commercial", detail: "Fees, meeting length and terms" },
    { title: "Site & SEO Settings", href: "/admin/site-settings", icon: "settings", detail: "Navigation, metadata, modules" },
  ]},
];

const ALL_ITEMS = ADMIN_NAV.flatMap((group) => group.items);


/* ---------- Icons ---------- */
export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
    home: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v10h13V10" /></>,
    tapin: <><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /><circle cx="12" cy="12" r="8.5" /></>,
    blog: <><path d="M5 3h10l4 4v14H5z" /><path d="M14 3v5h5M8 13h8M8 17h6" /></>,
    store: <><path d="M5 8h14l-1 12H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
    fk: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" /><path d="M17 5v6M14 8h6" /></>,
    review: <><path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>,
    enquiries: <><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9h8M8 12.5h5" /></>,
    subscribers: <><path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" /></>,
    analytics: <><path d="M4 20V4" /><path d="M4 20h16" /><path d="m7 15 4-4 3 3 5-7" /></>,
    media: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.8" /><path d="m4 18 5-5 4 4 3-3 4 4" /></>,
    commercial: <><circle cx="12" cy="12" r="9" /><path d="M14.5 9a3 3 0 0 0-5 1.5c0 3 5 1.5 5 4.5a3 3 0 0 1-5.2 1.3M12 6.5v1.5M12 16v1.5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.7a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.7a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z" /></>,
    more: <><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <span className="apd-logo" style={{ width: size, height: size }} aria-hidden="true">
      <Icon name="globe" size={Math.round(size * 0.62)} />
    </span>
  );
}


type Listing = { id: string; title: string; country: string; sector: string; status: string };
type Counts = { draft: number; reviewApps: number; newEnquiries: number };
const REVIEW_STATUSES = new Set(["review-required", "pending", "submitted", "new"]);

/** Sidebar, top bar, mobile bottom nav and the "More" sheet shared by every admin page. */
export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/admin";
  const [listings, setListings] = useState<Listing[]>([]);
  const [counts, setCounts] = useState<Counts>({ draft: 0, reviewApps: 0, newEnquiries: 0 });
  const [moreOpen, setMoreOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const read = async <T,>(url: string, key: string): Promise<T[]> => {
        try {
          const response = await fetch(url, { cache: "no-store" });
          if (!response.ok) return [];
          const data = await response.json() as Record<string, unknown>;
          return Array.isArray(data[key]) ? data[key] as T[] : [];
        } catch { return []; }
      };
      const [tapin, applications, enquiries] = await Promise.all([
        read<Listing>("/api/admin/tap-in/opportunities", "opportunities"),
        read<{ status: string }>("/api/admin/cms/work-with-fk", "records"),
        read<{ status: string }>("/api/admin/cms/enquiries", "records"),
      ]);
      if (!active) return;
      setListings(tapin);
      setCounts({
        draft: tapin.filter((item) => item.status === "draft").length,
        reviewApps: applications.filter((row) => REVIEW_STATUSES.has(row.status)).length,
        newEnquiries: enquiries.filter((row) => REVIEW_STATUSES.has(row.status)).length,
      });
    }
    const first = window.setTimeout(() => void load(), 0);
    const timer = window.setInterval(() => void load(), 5 * 60 * 1000);
    return () => { active = false; window.clearTimeout(first); window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    document.body.style.overflow = moreOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [moreOpen]);

  async function signOut() {
    try { await fetch("/api/admin/session", { method: "DELETE" }); }
    finally { window.location.reload(); }
  }

  const badges: Record<NonNullable<NavItem["badgeKey"]>, number> = { tapin: counts.draft, review: counts.reviewApps, enquiries: counts.newEnquiries };
  const attention = counts.draft + counts.reviewApps + counts.newEnquiries;

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return null;
    const modules = ALL_ITEMS.filter((item) => `${item.title} ${item.detail}`.toLowerCase().includes(term)).map((item) => ({ key: item.href, label: item.title, hint: "Module", href: item.href }));
    const found = listings.filter((item) => `${item.title} ${item.country} ${item.sector}`.toLowerCase().includes(term)).slice(0, 4).map((item) => ({ key: item.id, label: item.title, hint: "TAP IN listing", href: "/admin/tap-in" }));
    return [...modules, ...found].slice(0, 8);
  }, [query, listings]);

  // TAP IN and Homepage managers render their own <main>, so the shell uses a plain wrapper there to avoid nested landmarks.
  const ownsMain = pathname.startsWith("/admin/tap-in") || pathname.startsWith("/admin/homepage");

  return (
    <div className="apd">
      {/* ---------------- Desktop sidebar ---------------- */}
      <aside className="apd-sidebar" aria-label="Admin navigation">
        <Link href="/" className="apd-brand"><Logo /><span>THE AFRICA PLUG</span></Link>
        <nav className="apd-nav">
          {ADMIN_NAV.map((group, index) => (
            <div className="apd-nav-group" key={group.label ?? `g${index}`}>
              {group.label ? <p className="apd-nav-label">{group.label}</p> : null}
              {group.items.map((item) => {
                // Prevent /admin/store from matching /admin/store-orders via startsWith
                const active = item.href === "/admin" 
                  ? pathname === "/admin" 
                  : item.href === "/admin/store" 
                    ? pathname === "/admin/store" 
                    : pathname.startsWith(item.href);

                const badge = item.badgeKey ? badges[item.badgeKey] : 0;
                return (
                  <Link key={item.href} href={item.href} className={`apd-nav-link${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined}>
                    <Icon name={item.icon} /><span>{item.title}</span>
                    {badge > 0 ? <em className="apd-badge">{badge}</em> : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <p className="apd-script">More<br />Opportunities.<br />Bigger Dreams.</p>
        <div className="apd-side-foot"><Logo size={30} /><div><b>THE AFRICA PLUG</b><small>Connecting Africa to Opportunity</small></div></div>
      </aside>

      <div className="apd-main">
        {/* ---------------- Top bar ---------------- */}
        <header className="apd-topbar">
          <button type="button" className="apd-menu-btn" aria-label="Open all modules" onClick={() => setMoreOpen(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
          <Link href="/" className="apd-top-brand"><Logo size={30} /><span>THE AFRICA PLUG</span></Link>

          <div className="apd-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search anything… (e.g. opportunities, modules, settings)" aria-label="Search the admin" />
            {results ? (
              <ul className="apd-search-results">
                {results.length === 0 ? <li className="apd-search-empty">No matches found</li> : results.map((result) => (
                  <li key={result.key}><Link href={result.href} onClick={() => setQuery("")}><span>{result.label}</span><small>{result.hint}</small></Link></li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="apd-top-actions">
            <div className="apd-pop-wrap">
              <button type="button" className="apd-bell" aria-label={`Notifications${attention ? `, ${attention} need attention` : ""}`} aria-expanded={bellOpen} onClick={() => { setBellOpen((open) => !open); setUserOpen(false); }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z" /><path d="M10 21h4" /></svg>
                {attention > 0 ? <em className="apd-dot">{attention > 99 ? "99+" : attention}</em> : null}
              </button>
              {bellOpen ? (
                <div className="apd-pop" role="menu">
                  <p className="apd-pop-title">Needs your attention</p>
                  <Link href="/admin/tap-in" role="menuitem"><span>Draft TAP IN listings</span><b>{counts.draft}</b></Link>
                  <Link href="/admin/review-required" role="menuitem"><span>Applications to review</span><b>{counts.reviewApps}</b></Link>
                  <Link href="/admin/enquiries" role="menuitem"><span>New enquiries</span><b>{counts.newEnquiries}</b></Link>
                </div>
              ) : null}
            </div>
            <div className="apd-pop-wrap">
              <button type="button" className="apd-user" aria-expanded={userOpen} onClick={() => { setUserOpen((open) => !open); setBellOpen(false); }}>
                <span className="apd-avatar">AD</span><span className="apd-user-name">Admin</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
              </button>
              {userOpen ? (
                <div className="apd-pop apd-pop-narrow" role="menu">
                  <Link href="/" role="menuitem"><span>View website ↗</span></Link>
                  <button type="button" role="menuitem" onClick={() => void signOut()}><span>Sign out</span></button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {ownsMain ? <div className="apd-content">{children}</div> : <main className="apd-content">{children}</main>}
      </div>

      {/* ---------------- Mobile bottom nav ---------------- */}
      <nav className="apd-bottom" aria-label="Primary">
        <Link href="/admin" className={pathname === "/admin" ? "is-active" : undefined}><Icon name="home" size={21} /><span>Home</span></Link>
        <Link href="/admin/tap-in" className={pathname.startsWith("/admin/tap-in") ? "is-active" : undefined}><Icon name="tapin" size={21} /><span>TAP IN</span>{counts.draft > 0 ? <em className="apd-badge apd-badge-float">{counts.draft}</em> : null}</Link>
        <Link href="/admin/blog" className={pathname.startsWith("/admin/blog") ? "is-active" : undefined}><Icon name="blog" size={21} /><span>Blog</span></Link>
        <Link href="/admin/store" className={pathname === "/admin/store" ? "is-active" : undefined}><Icon name="store" size={21} /><span>Store</span></Link>
        <button type="button" className={!["/admin","/admin/tap-in","/admin/blog","/admin/store"].some((p) => p === "/admin" ? pathname === p : pathname.startsWith(p)) ? "is-active" : undefined} onClick={() => setMoreOpen(true)} aria-haspopup="dialog" aria-expanded={moreOpen}><Icon name="more" size={21} /><span>More</span></button>
      </nav>

      {/* ---------------- Mobile "More" sheet: every module ---------------- */}
      {moreOpen ? (
        <div className="apd-sheet-wrap" role="dialog" aria-modal="true" aria-label="All admin modules">
          <button type="button" className="apd-sheet-scrim" aria-label="Close menu" onClick={() => setMoreOpen(false)} />
          <div className="apd-sheet">
            <div className="apd-sheet-head"><b>All modules</b><button type="button" onClick={() => setMoreOpen(false)} aria-label="Close">✕</button></div>
            <div className="apd-sheet-body">
              {ADMIN_NAV.map((group, index) => (
                <section key={group.label ?? `s${index}`}>
                  <p className="apd-nav-label">{group.label ?? "MAIN"}</p>
                  <div className="apd-sheet-grid">
                    {group.items.map((item) => {
                      const badge = item.badgeKey ? badges[item.badgeKey] : 0;
                      return (
                        <Link key={item.href} href={item.href} className="apd-sheet-item" onClick={() => setMoreOpen(false)}>
                          <span className="apd-sheet-icon"><Icon name={item.icon} size={20} />{badge > 0 ? <em className="apd-badge apd-badge-float">{badge}</em> : null}</span>
                          <b>{item.title}</b>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
              <div className="apd-sheet-foot">
                <Link href="/" className="apd-btn-ghost">View website ↗</Link>
                <button type="button" className="apd-btn-primary" onClick={() => void signOut()}>Sign out</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
