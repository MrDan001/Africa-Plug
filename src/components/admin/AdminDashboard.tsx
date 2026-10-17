// FILE PATH: src/components/admin/AdminDashboard.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import "./AdminDashboard.css";

/* ---------- Module registry: single source for desktop sidebar + mobile "More" sheet ---------- */
type IconName =
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
    { title: "Store Orders", href: "/admin/store-orders", icon: "store", detail: "Payments, purchases and digital delivery" },
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

/* ---------- Types ---------- */
type Opportunity = {
  id: string; slug: string; title: string; country: string; region: string; sector: string;
  opportunity_type: string; status: "draft" | "live" | "closed" | "archived";
  image_url: string | null; created_at?: string; updated_at: string;
};
type CmsRow = { id: string; title: string; status: string; created_at: string; updated_at: string; data?: Record<string, unknown> };
type Feed = { tapin: Opportunity[]; applications: CmsRow[]; enquiries: CmsRow[]; subscribers: CmsRow[]; articles: CmsRow[]; products: CmsRow[] };
type LoadState = "loading" | "ready";

const EMPTY: Feed = { tapin: [], applications: [], enquiries: [], subscribers: [], articles: [], products: [] };
const REVIEW_STATUSES = new Set(["review-required", "pending", "submitted", "new"]);

/* ---------- Icons ---------- */
function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
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

function Logo({ size = 40 }: { size?: number }) {
  return (
    <span className="apd-logo" style={{ width: size, height: size }} aria-hidden="true">
      <Icon name="globe" size={Math.round(size * 0.62)} />
    </span>
  );
}

/* ---------- Helpers ---------- */
function timeAgo(value: string) {
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return "";
  const minutes = Math.max(0, Math.round((Date.now() - time) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function shortDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
}

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

function statusLabel(status: Opportunity["status"]) {
  return status === "live" ? "Live" : status === "draft" ? "Draft" : status === "closed" ? "Closed" : "Archived";
}

/** Cumulative total of listings at the end of each of the last 8 days. */
function buildTrend(items: Opportunity[]) {
  const days: { label: string; total: number }[] = [];
  for (let offset = 7; offset >= 0; offset -= 1) {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    end.setDate(end.getDate() - offset);
    const total = items.filter((item) => {
      const created = new Date(item.created_at ?? item.updated_at).getTime();
      return Number.isFinite(created) && created <= end.getTime();
    }).length;
    days.push({ label: end.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), total });
  }
  return days;
}

/* ---------- Main component ---------- */
export default function AdminDashboard() {
  const pathname = usePathname() || "/admin";
  const [feed, setFeed] = useState<Feed>(EMPTY);
  const [state, setState] = useState<LoadState>("loading");
  const [failed, setFailed] = useState<string[]>([]);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const [now, setNow] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [query, setQuery] = useState("");

  async function load() {
    const get = async <T,>(url: string, pick: (data: Record<string, unknown>) => T): Promise<T> => {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(url);
      return pick(await response.json() as Record<string, unknown>);
    };
    const cms = (module: string) => get(`/api/admin/cms/${module}`, (data) => (Array.isArray(data.records) ? data.records : []) as CmsRow[]);
    const jobs = [
      { name: "TAP IN", run: get("/api/admin/tap-in/opportunities", (data) => (Array.isArray(data.opportunities) ? data.opportunities : []) as Opportunity[]) },
      { name: "Applications", run: cms("work-with-fk") },
      { name: "Enquiries", run: cms("enquiries") },
      { name: "Subscribers", run: cms("subscribers") },
      { name: "Blog", run: cms("blog") },
      { name: "Store", run: cms("store") },
    ];
    const results = await Promise.allSettled(jobs.map((job) => job.run));
    const bad: string[] = [];
    const value = <T,>(index: number, fallback: T): T => {
      const result = results[index];
      if (result.status === "fulfilled") return result.value as T;
      bad.push(jobs[index].name);
      return fallback;
    };
    setFeed({
      tapin: value<Opportunity[]>(0, []),
      applications: value<CmsRow[]>(1, []),
      enquiries: value<CmsRow[]>(2, []),
      subscribers: value<CmsRow[]>(3, []),
      articles: value<CmsRow[]>(4, []),
      products: value<CmsRow[]>(5, []),
    });
    setFailed(bad);
    setCheckedAt(new Date());
    setNow(Date.now());
    setState("ready");
  }

  useEffect(() => {
    const first = window.setTimeout(() => void load(), 0);
    const timer = window.setInterval(() => void load(), 5 * 60 * 1000);
    return () => { window.clearTimeout(first); window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    document.body.style.overflow = moreOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [moreOpen]);

  async function signOut() {
    try { await fetch("/api/admin/session", { method: "DELETE" }); }
    finally { window.location.reload(); }
  }

  /* ---- derived numbers (all real data) ---- */
  const counts = useMemo(() => {
    const total = feed.tapin.length;
    const draft = feed.tapin.filter((item) => item.status === "draft").length;
    const live = feed.tapin.filter((item) => item.status === "live").length;
    const closed = feed.tapin.filter((item) => item.status === "closed" || item.status === "archived").length;
    const weekAgo = now - 7 * 86400000;
    const twoWeeksAgo = now - 14 * 86400000;
    const created = (from: number, to: number) => feed.tapin.filter((item) => {
      const time = new Date(item.created_at ?? item.updated_at).getTime();
      return time > from && time <= to;
    }).length;
    const thisWeek = created(weekAgo, now);
    const lastWeek = created(twoWeeksAgo, weekAgo);
    const reviewApps = feed.applications.filter((row) => REVIEW_STATUSES.has(row.status)).length;
    const newEnquiries = feed.enquiries.filter((row) => REVIEW_STATUSES.has(row.status)).length;
    return { total, draft, live, closed, thisWeek, lastWeek, reviewApps, newEnquiries, liveRate: total ? Math.round((live / total) * 100) : 0 };
  }, [feed, now]);

  const badges: Record<NonNullable<NavItem["badgeKey"]>, number> = {
    tapin: counts.draft, review: counts.reviewApps, enquiries: counts.newEnquiries,
  };
  const attention = counts.draft + counts.reviewApps + counts.newEnquiries;

  const trend = useMemo(() => buildTrend(feed.tapin), [feed.tapin]);
  const activity = useMemo(() => {
    type Entry = { id: string; title: string; sub: string; at: string; tone: "pink" | "green" | "blue" | "red" | "amber" };
    const entries: Entry[] = [
      ...feed.tapin.map<Entry>((item) => ({
        id: `t-${item.id}`,
        title: item.status === "live" ? "Listing published" : item.status === "draft" ? "Listing saved as draft" : item.status === "closed" ? "Listing closed" : "Listing archived",
        sub: item.title, at: item.updated_at,
        tone: item.status === "live" ? "green" : item.status === "draft" ? "pink" : "red",
      })),
      ...feed.applications.map<Entry>((row) => ({ id: `a-${row.id}`, title: "New application", sub: row.title, at: row.created_at, tone: "blue" })),
      ...feed.enquiries.map<Entry>((row) => ({ id: `e-${row.id}`, title: "New enquiry", sub: row.title, at: row.created_at, tone: "amber" })),
    ];
    return entries.filter((entry) => Number.isFinite(new Date(entry.at).getTime())).sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 5);
  }, [feed]);

  const latest = useMemo(
    () => [...feed.tapin].sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at)).slice(0, 4),
    [feed.tapin],
  );

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return null;
    const modules = ALL_ITEMS.filter((item) => `${item.title} ${item.detail}`.toLowerCase().includes(term)).map((item) => ({ key: item.href, label: item.title, hint: "Module", href: item.href }));
    const listings = feed.tapin.filter((item) => `${item.title} ${item.country} ${item.sector}`.toLowerCase().includes(term)).slice(0, 4).map((item) => ({ key: item.id, label: item.title, hint: "TAP IN listing", href: "/admin/tap-in" }));
    return [...modules, ...listings].slice(0, 8);
  }, [query, feed.tapin]);

  const delta = counts.thisWeek - counts.lastWeek;
  const loading = state === "loading";
  const num = (value: number) => (loading ? "–" : String(value));

  const stats = [
    { label: "Total Listings", value: counts.total, tone: "pink", icon: "tapin" as IconName, note: loading ? "Loading…" : `${counts.thisWeek} new in last 7 days`, trend: delta === 0 ? "flat" : delta > 0 ? "up" : "down", trendText: delta === 0 ? "No change" : `${delta > 0 ? "↑ +" : "↓ "}${delta} vs prior week` },
    { label: "Pending Review", value: counts.draft, tone: "amber", icon: "review" as IconName, note: "drafts needing attention", trend: counts.draft ? "warn" : "flat", trendText: counts.draft ? "Needs attention" : "All clear" },
    { label: "Approved", value: counts.live, tone: "green", icon: "blog" as IconName, note: "live on TAP IN", trend: "up", trendText: `${counts.liveRate}% of listings` },
    { label: "Rejected", value: counts.closed, tone: "red", icon: "enquiries" as IconName, note: "closed or archived", trend: "flat", trendText: counts.total ? `${Math.round((counts.closed / counts.total) * 100)}% of listings` : "—" },
  ];

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
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
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

        <main className="apd-content">
          <div className="apd-grid">
            <div className="apd-left">
              {/* ---------------- Welcome ---------------- */}
              <section className="apd-welcome">
                <div>
                  <span className="apd-pill">WELCOME BACK</span>
                  <h1>{greeting()}, Admin! <span aria-hidden="true">👋</span></h1>
                  <p>Here&apos;s what&apos;s happening with Africa Plug today.<br />Manage opportunities, content, and grow our impact across Africa.</p>
                </div>
                <p className="apd-script apd-script-hero" aria-hidden="true">Real Opportunities.<br />Real Impact.</p>
              </section>

              {/* ---------------- Stat cards ---------------- */}
              <section className="apd-stats" aria-label="Listing summary">
                {stats.map((stat) => (
                  <article className="apd-stat" key={stat.label}>
                    <div className="apd-stat-head"><span className={`apd-stat-icon is-${stat.tone}`}><Icon name={stat.icon} size={17} /></span><span>{stat.label}</span></div>
                    <strong>{num(stat.value)}</strong>
                    <p className={`apd-trend is-${stat.trend}`}>{loading ? " " : stat.trendText}</p>
                    <small>{stat.note}</small>
                  </article>
                ))}
              </section>

              {/* ---------------- Chart + activity ---------------- */}
              <div className="apd-two">
                <section className="apd-card">
                  <h2>Listing Overview</h2>
                  <strong className="apd-big">{num(counts.total)}</strong>
                  <p className="apd-muted">Total Listings</p>
                  <p className={`apd-trend is-${delta >= 0 ? "up" : "down"}`}>{loading ? " " : `${delta >= 0 ? "↑ +" : "↓ "}${delta} vs. prior 7 days`}</p>
                  <TrendChart data={trend} />
                </section>

                <section className="apd-card">
                  <div className="apd-card-head"><h2>Recent Activity</h2><Link href="/admin/tap-in">View all</Link></div>
                  {loading ? <p className="apd-empty">Loading activity…</p> : activity.length === 0 ? <p className="apd-empty">No activity yet. New listings, applications and enquiries will appear here.</p> : (
                    <ul className="apd-activity">
                      {activity.map((entry) => (
                        <li key={entry.id}>
                          <span className={`apd-act-dot is-${entry.tone}`} />
                          <div><b>{entry.title}</b><small>{entry.sub}</small></div>
                          <time>{timeAgo(entry.at)}</time>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>

              {/* ---------------- Latest listings ---------------- */}
              <section className="apd-card">
                <div className="apd-card-head"><h2>Latest Listings</h2><Link href="/admin/tap-in">View all</Link></div>
                {loading ? <p className="apd-empty">Loading listings…</p> : latest.length === 0 ? (
                  <p className="apd-empty">No TAP IN listings yet. <Link href="/admin/tap-in" className="apd-inline">Create the first one →</Link></p>
                ) : (
                  <div className="apd-listings">
                    {latest.map((item) => (
                      <Link href="/admin/tap-in" className="apd-listing" key={item.id}>
                        <div className="apd-thumb">
                          {item.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image_url} alt="" loading="lazy" />
                          ) : <span className="apd-thumb-empty"><Icon name="tapin" size={28} /></span>}
                          <span className={`apd-status is-${item.status}`}>{statusLabel(item.status)}</span>
                        </div>
                        <h3>{item.title}</h3>
                        <p className="apd-loc">{[item.region, item.country].filter(Boolean).join(", ") || "Location not set"}</p>
                        <div className="apd-chips">
                          {item.sector ? <span>{item.sector}</span> : null}
                          {item.opportunity_type ? <span>{item.opportunity_type}</span> : null}
                        </div>
                        <small className="apd-date">Updated {shortDate(item.updated_at)}</small>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* ---------------- Right rail ---------------- */}
            <aside className="apd-right">
              <section className="apd-card apd-quick">
                <h2>Quick Actions</h2>
                <Link href="/admin/tap-in" className="apd-btn-primary"><span aria-hidden="true">＋</span> Create New Listing</Link>
                <Link href="/admin/tap-in" className="apd-btn-ghost">View All Listings</Link>
                <Link href="/admin/blog" className="apd-btn-ghost">Manage Blog Posts</Link>
              </section>

              <section className="apd-card apd-system">
                <h2>System Status</h2>
                {loading ? <p className="apd-status-pill is-wait">Checking…</p> : failed.length === 0 ? (
                  <p className="apd-status-pill is-ok"><i /> All Systems Operational</p>
                ) : (
                  <p className="apd-status-pill is-bad"><i /> Issue with: {failed.join(", ")}</p>
                )}
                <small className="apd-muted">{checkedAt ? `Last checked: ${timeAgo(checkedAt.toISOString())}` : "Running checks…"}</small>
              </section>

              <section className="apd-card apd-impact">
                <h2>Your Impact</h2>
                <span className="apd-impact-icon"><Icon name="globe" size={22} /></span>
                <strong>{num(counts.total)}</strong>
                <p>opportunities created</p>
                <small className="apd-muted">{loading ? " " : `${counts.live} live now · ${feed.subscribers.length} subscribers · ${feed.articles.length} articles`}</small>
              </section>

              <p className="apd-script apd-script-rail" aria-hidden="true">Together<br />We Grow<br />Africa</p>
            </aside>
          </div>
        </main>
      </div>

      {/* ---------------- Mobile bottom nav ---------------- */}
      <nav className="apd-bottom" aria-label="Primary">
        <Link href="/admin" className="is-active"><Icon name="home" size={21} /><span>Home</span></Link>
        <Link href="/admin/tap-in"><Icon name="tapin" size={21} /><span>TAP IN</span>{counts.draft > 0 ? <em className="apd-badge apd-badge-float">{counts.draft}</em> : null}</Link>
        <Link href="/admin/blog"><Icon name="blog" size={21} /><span>Blog</span></Link>
        <Link href="/admin/store"><Icon name="store" size={21} /><span>Store</span></Link>
        <button type="button" onClick={() => setMoreOpen(true)} aria-haspopup="dialog" aria-expanded={moreOpen}><Icon name="more" size={21} /><span>More</span></button>
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

/* ---------- Line chart (SVG, no dependencies) ---------- */
function TrendChart({ data }: { data: { label: string; total: number }[] }) {
  const width = 420, height = 150, padX = 14, padTop = 14, padBottom = 12;
  const max = Math.max(1, ...data.map((point) => point.total));
  const min = Math.min(...data.map((point) => point.total));
  const span = Math.max(1, max - min);
  const step = (width - padX * 2) / Math.max(1, data.length - 1);
  const points = data.map((point, index) => ({
    x: padX + index * step,
    y: padTop + (1 - (point.total - min) / span) * (height - padTop - padBottom),
    ...point,
  }));
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${padX},${height} ${line} ${padX + (data.length - 1) * step},${height}`;
  const labelIndexes = [0, 2, 4, 6, 7].filter((index) => index < data.length);
  return (
    <div className="apd-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Total listings over the last 8 days, now ${data[data.length - 1]?.total ?? 0}`}>
        <defs><linearGradient id="apd-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff2d87" stopOpacity=".28" /><stop offset="1" stopColor="#ff2d87" stopOpacity="0" /></linearGradient></defs>
        <polygon points={area} fill="url(#apd-fill)" />
        <polyline points={line} fill="none" stroke="#f0287f" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {points.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r={index === points.length - 1 ? 4.5 : 3} fill="#fff" stroke="#f0287f" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="apd-chart-axis">{labelIndexes.map((index) => <span key={index}>{data[index].label}</span>)}</div>
    </div>
  );
}
