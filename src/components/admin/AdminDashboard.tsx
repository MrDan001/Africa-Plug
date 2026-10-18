// FILE PATH: src/components/admin/AdminDashboard.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon, type IconName } from "@/components/admin/AdminShell";
import "./AdminDashboard.css";

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
  const [feed, setFeed] = useState<Feed>(EMPTY);
  const [state, setState] = useState<LoadState>("loading");
  const [failed, setFailed] = useState<string[]>([]);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const [now, setNow] = useState(0);

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