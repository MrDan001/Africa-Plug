"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import "./AdminAnalytics.css";

type Rec = { id: string; title: string; status: string; data: Record<string, unknown>; created_at: string };
type Order = { id: string; status: string; currency: string; amount_total: number; checkout_completed_at?: string; created_at: string; order_items?: { description?: string }[] };
type Item = { t: number; w: number; k?: string };
type Act = { id: string; t: number; kind: "app" | "order" | "sub" | "wait"; title: string; sub: string };

const DAY = 86_400_000;
const ZERO_DECIMAL = new Set(["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"]);
const str = (v: unknown) => (typeof v === "string" ? v : "");
const stamp = (iso: string) => { const t = new Date(iso).getTime(); return Number.isNaN(t) ? 0 : t; };
const startOfDay = (t: number) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const num = (n: number) => n.toLocaleString("en-GB");
const short = (n: number) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k" : String(Math.round(n * 10) / 10));
const money = (major: number, code: string) => {
  try { return new Intl.NumberFormat("en-GB", { style: "currency", currency: code, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(major); }
  catch { return `${code} ${major.toFixed(2)}`; }
};
const dayLabel = (t: number) => new Date(t).toLocaleDateString("en-US", { month: "short", day: "2-digit" });

function bucket(items: Item[], start: number, days: number) {
  const out = new Array<number>(days).fill(0);
  for (const it of items) { const i = Math.floor((it.t - start) / DAY); if (i >= 0 && i < days) out[i] += it.w; }
  return out;
}
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
function change(cur: number, prev: number) {
  if (prev === 0) return cur === 0 ? { label: "—", dir: 0 } : { label: "New", dir: 1 };
  const p = ((cur - prev) / prev) * 100;
  return { label: `${p >= 0 ? "+" : ""}${p.toFixed(1)}%`, dir: p > 0 ? 1 : p < 0 ? -1 : 0 };
}

// Smooth curve through points (Catmull-Rom converted to bezier), kept inside [lo, hi] vertically.
function smooth(p: number[][], lo: number, hi: number) {
  if (p.length === 0) return "";
  if (p.length === 1) return `M${p[0][0]},${p[0][1]}`;
  const c = (v: number) => Math.min(hi, Math.max(lo, v));
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${c(p1[1] + (p2[1] - p0[1]) / 6)} ${p2[0] - (p3[0] - p1[0]) / 6},${c(p2[1] - (p3[1] - p1[1]) / 6)} ${p2[0]},${p2[1]}`;
  }
  return d;
}

// A decision counts only once the applicant was emailed, or a payment link already exists (same rule as Work With FK).
function isDecided(r: Rec) {
  const s = r.status.toLowerCase();
  if (s !== "approved" && s !== "declined") return false;
  const pay = str(r.data?.paymentStatus);
  return !!str(r.data?.decisionEmailSentAt) || (!!pay && pay !== "pending") || !!str(r.data?.paymentLinkCreatedAt);
}
function ago(t: number, now: number) {
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return "just now";
  const mins = Math.floor(s / 60); if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); if (d < 7) return `${d}d ago`;
  return new Date(t).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
// Revenue bars: daily for 7 days, four weeks for 30 days, three months for 90 days.
function regroup(daily: number[], start: number) {
  const days = daily.length;
  if (days <= 7) return daily.map((v, i) => ({ label: new Date(start + i * DAY).toLocaleDateString("en-GB", { weekday: "short" }), v }));
  const k = days <= 30 ? 4 : 3, size = Math.floor(days / k);
  return Array.from({ length: k }, (_, g) => ({ label: (days <= 30 ? "W" : "M") + (g + 1), v: sum(daily.slice(g * size, g === k - 1 ? days : (g + 1) * size)) }));
}

const PAGE_NAMES: Record<string, string> = { "": "Home", "work-with-fk": "Work With FK", store: "Store", "tap-in": "T.A.P IN", blog: "Blog", contact: "Contact", about: "About" };
function pageName(path: string) {
  const seg = (path.split("?")[0].split("/").filter(Boolean)[0] ?? "").toLowerCase();
  return PAGE_NAMES[seg] ?? seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const ICONS: Record<string, React.ReactNode> = {
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c.4-3.2 2.6-5 5.5-5s5.1 1.8 5.5 5" /><circle cx="17" cy="9" r="2.4" /><path d="M16 14.2c2.6.1 4.2 1.7 4.6 4.3" /></>,
  send: <><path d="M21 3 10 14" /><path d="m21 3-7 18-4-7-7-4z" /></>,
  cart: <><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M3 4h2.4l2.1 11h10.8l2-8H6.2" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></>,
  wallet: <><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" /><rect x="3" y="8" width="18" height="11" rx="2.5" /><circle cx="16.5" cy="13.5" r="1.1" /></>,
  calendar: <><rect x="4" y="5.5" width="16" height="14" rx="2.5" /><path d="M8 3.5v4M16 3.5v4M4 10h16" /></>,
  bars: <path d="M6 20v-7M12 20V6M18 20v-10" />,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.8" /></>,
  funnel: <path d="M3.5 4.5h17L14 12.2V19l-4 2v-8.8z" />,
  bolt: <path d="M13 2.5 4.5 14H11l-1 7.5L19.5 10H13z" />,
  bag: <><path d="M6 8h12l1 12H5z" /><path d="M9 8a3 3 0 0 1 6 0" /></>,
};
const Icon = ({ name }: { name: string }) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[name]}</svg>;

function Spark({ data, color, gid }: { data: number[]; color: string; gid: string }) {
  const w = 140, h = 46, max = Math.max(...data, 1);
  const pts = data.map((v, i) => [data.length > 1 ? (i * w) / (data.length - 1) : w, h - 4 - (v / max) * (h - 12)]);
  const line = smooth(pts, 2, h - 2);
  return <svg className="apx-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".28" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
    {pts.length > 1 ? <path d={`${line} L${w},${h} L0,${h} Z`} fill={`url(#${gid})`} /> : null}
    <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
  </svg>;
}

function TrafficChart({ cur, prev, start }: { cur: number[]; prev: number[]; start: number }) {
  const days = cur.length, W = 640, H = 290, L = 46, R = 18, T = 20, B = 32;
  const maxV = Math.max(...cur, ...prev, 0);
  const raw = Math.max(maxV, 4) / 4, pow = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / pow;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * pow, top = step * 4;
  const x = (i: number) => L + (days > 1 ? (i * (W - L - R)) / (days - 1) : 0);
  const y = (v: number) => T + (H - T - B) * (1 - v / top);
  const pc = cur.map((v, i) => [x(i), y(v)]), pp = prev.map((v, i) => [x(i), y(v)]);
  const line = smooth(pc, T, H - B);
  const count = Math.min(days, days <= 7 ? days : 6);
  const ticks = Array.from(new Set(Array.from({ length: count }, (_, k) => Math.round((k * (days - 1)) / Math.max(count - 1, 1)))));
  const last = pc[pc.length - 1] ?? [L, H - B];
  const label = num(cur[cur.length - 1] ?? 0), bw = label.length * 8 + 22;
  const by = last[1] - 40 < 0 ? last[1] + 10 : last[1] - 40;
  return <svg className="apx-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Page views over time, this period against the previous period">
    <defs><linearGradient id="apx-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f0287f" stopOpacity=".26" /><stop offset="1" stopColor="#f0287f" stopOpacity=".02" /></linearGradient></defs>
    {[0, 1, 2, 3, 4].map((k) => <g key={k}><line x1={L} x2={W - R} y1={y(step * k)} y2={y(step * k)} className="apx-grid" /><text x={L - 8} y={y(step * k) + 4} textAnchor="end" className="apx-axis">{short(step * k)}</text></g>)}
    {ticks.map((i) => <g key={i}><line x1={x(i)} x2={x(i)} y1={T} y2={H - B} className="apx-grid apx-grid-v" /><text x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === days - 1 ? "end" : "middle"} className="apx-axis">{dayLabel(start + i * DAY)}</text></g>)}
    {days > 1 ? <path d={`${line} L${x(days - 1)},${H - B} L${x(0)},${H - B} Z`} fill="url(#apx-area)" /> : null}
    <path d={smooth(pp, T, H - B)} fill="none" className="apx-prev" />
    <path d={line} fill="none" className="apx-cur" />
    <circle cx={last[0]} cy={last[1]} r="5" className="apx-dot" />
    <g transform={`translate(${Math.max(L, last[0] + 10 - bw)},${by})`}><rect width={bw} height="28" rx="9" className="apx-bubble" /><text x={bw / 2} y="18.5" textAnchor="middle" className="apx-bubble-text">{label}</text></g>
    {cur.map((v, i) => <rect key={i} x={x(i) - (W - L - R) / Math.max(days - 1, 1) / 2} y={T} width={(W - L - R) / Math.max(days - 1, 1)} height={H - T - B} fill="transparent"><title>{`${dayLabel(start + i * DAY)}: ${num(v)} views (previous: ${num(prev[i] ?? 0)})`}</title></rect>)}
  </svg>;
}

export default function AdminAnalytics({ events, loading: eventsLoading, onRefresh }: { events: Rec[]; loading: boolean; onRefresh: () => void }) {
  const [days, setDays] = useState(30);
  const [apps, setApps] = useState<Rec[]>([]);
  const [subs, setSubs] = useState<Rec[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [waitlist, setWaitlist] = useState<Rec[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [busy, setBusy] = useState(true);
  const [failed, setFailed] = useState<string[]>([]);
  const [now, setNow] = useState(() => Date.now());

  const loadOthers = useCallback(async () => {
    setBusy(true);
    setNow(Date.now());
    const bad: string[] = [];
    const get = async <T,>(url: string, label: string): Promise<T | null> => {
      try { const r = await fetch(url, { cache: "no-store" }); if (!r.ok) throw new Error(String(r.status)); return await r.json() as T; }
      catch { bad.push(label); return null; }
    };
    const [a, s, o, w] = await Promise.all([
      get<{ records?: Rec[] }>("/api/admin/cms/work-with-fk?status=all", "Work With FK applications"),
      get<{ records?: Rec[] }>("/api/admin/cms/subscribers?status=all", "Subscribers"),
      get<{ orders?: Order[] }>("/api/admin/store-orders?status=all", "Store orders"),
      get<{ records?: Rec[] }>("/api/admin/store-waitlists", "Store waitlists"),
    ]);
    setApps(a?.records ?? []); setSubs(s?.records ?? []); setOrders(o?.orders ?? []); setWaitlist(w?.records ?? []);
    setFailed(bad); setBusy(false);
  }, []);
  // Fetch-on-mount: loadOthers updates loading state before the requests start.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadOthers(); }, [loadOthers]);

  const m = useMemo(() => {
    const end = startOfDay(now) + DAY, start = end - days * DAY, pStart = start - days * DAY;
    const views: Item[] = events.filter((r) => r.data?.eventName === "page_view").map((r) => ({ t: stamp(str(r.data.recordedAt)) || stamp(r.created_at), w: 1, k: str(r.data.path) || "/" }));
    const appItems: Item[] = apps.filter((r) => r.data?.kind !== "call").map((r) => ({ t: stamp(r.created_at), w: 1 }));
    const subItems: Item[] = subs.map((r) => ({ t: stamp(r.created_at), w: 1 }));
    const counted = orders.filter((o) => o.status !== "processing");
    const orderItems: Item[] = counted.map((o) => ({ t: stamp(o.checkout_completed_at || o.created_at), w: 1 }));
    const paid = orders.filter((o) => o.status === "paid").sort((a, b) => stamp(b.created_at) - stamp(a.created_at));
    const code = /^[A-Z]{3}$/.test(paid[0]?.currency?.toUpperCase() ?? "") ? paid[0].currency.toUpperCase() : "GBP";
    const div = ZERO_DECIMAL.has(code) ? 1 : 100;
    const revItems: Item[] = paid.filter((o) => (o.currency || "").toUpperCase() === code).map((o) => ({ t: stamp(o.checkout_completed_at || o.created_at), w: o.amount_total / div }));
    const split = (items: Item[]) => { const cur = bucket(items, start, days), prev = bucket(items, pStart, days); return { cur, prev, total: sum(cur), before: sum(prev), chg: change(sum(cur), sum(prev)) }; };
    const v = split(views), a = split(appItems), o = split(orderItems), s = split(subItems), r = split(revItems);
    const byPage = new Map<string, number>();
    for (const it of views) if (it.t >= start && it.t < end) { const n = pageName(it.k ?? "/"); byPage.set(n, (byPage.get(n) ?? 0) + 1); }
    const pages = [...byPage.entries()].sort((x, y) => y[1] - x[1]).slice(0, 5).map(([name, count]) => ({ name, count, pct: v.total ? (count / v.total) * 100 : 0 }));
    // Application funnel for the selected period.
    const appsIn = apps.filter((x) => x.data?.kind !== "call" && stamp(x.created_at) >= start && stamp(x.created_at) < end);
    const fTotal = appsIn.length;
    const funnel = [
      { label: "Applications", value: fTotal },
      { label: "Pending Review", value: appsIn.filter((x) => !isDecided(x)).length },
      { label: "Approved", value: appsIn.filter((x) => isDecided(x) && x.status.toLowerCase() === "approved").length },
      { label: "Paid Deals", value: appsIn.filter((x) => str(x.data?.paymentStatus) === "confirmed").length },
    ].map((row, i) => ({ ...row, pct: i > 0 && fTotal > 0 ? Math.round((row.value / fTotal) * 100) : null }));
    // Revenue bars.
    const bars = regroup(r.cur, start);
    // Recent activity across the site (not limited to the selected period).
    const acts: Act[] = [
      ...apps.filter((x) => x.data?.kind !== "call").map((x): Act => ({ id: "a" + x.id, t: stamp(x.created_at), kind: "app", title: "New Work With FK application", sub: str(x.data?.email) || str(x.data?.fullName) || x.title })),
      ...counted.map((x): Act => {
        const c = /^[A-Z]{3}$/.test((x.currency || "").toUpperCase()) ? x.currency.toUpperCase() : "GBP";
        return { id: "o" + x.id, t: stamp(x.checkout_completed_at || x.created_at), kind: "order", title: "New order placed", sub: `${x.order_items?.[0]?.description || "Store order"} · ${money(x.amount_total / (ZERO_DECIMAL.has(c) ? 1 : 100), c)}` };
      }),
      ...subs.map((x): Act => ({ id: "s" + x.id, t: stamp(x.created_at), kind: "sub", title: "New subscriber", sub: str(x.data?.email) || x.title })),
      ...waitlist.map((x): Act => ({ id: "w" + x.id, t: stamp(x.created_at), kind: "wait", title: "Store waitlist signup", sub: str(x.data?.resolvedProductTitle) || str(x.data?.opportunityName) || str(x.data?.email) })),
    ].filter((x) => x.t > 0).sort((x, y) => y.t - x.t).slice(0, 10);
    return { start, v, a, o, s, r, code, pages, funnel, bars, acts };
  }, [events, apps, subs, orders, waitlist, days, now]);

  const kpis = [
    { label: "Total Views", icon: "users", color: "#f0287f", d: m.v, value: num(m.v.total) },
    { label: "Work With FK Apps", icon: "send", color: "#7c4dff", d: m.a, value: num(m.a.total) },
    { label: "Store Orders", icon: "cart", color: "#19a463", d: m.o, value: num(m.o.total) },
    { label: "Newsletter Subscribers", icon: "mail", color: "#f28a1b", d: m.s, value: num(m.s.total) },
    { label: "Total Revenue", icon: "wallet", color: "#5b52d6", d: m.r, value: money(m.r.total, m.code) },
  ];
  const loading = eventsLoading || busy;

  return <div className="apm apx">
    <header className="apx-head">
      <div><h1>Analytics &amp; Funnel</h1><p>Track performance, measure growth and understand your audience.</p></div>
      <div className="apx-head-actions">
        <label className="apx-range"><Icon name="calendar" /><select value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Date range"><option value={7}>Last 7 Days</option><option value={30}>Last 30 Days</option><option value={90}>Last 90 Days</option></select></label>
        <button type="button" className="apx-refresh" onClick={() => { onRefresh(); void loadOthers(); }} aria-label="Refresh analytics" title="Refresh">↻</button>
      </div>
    </header>
    {failed.length ? <p className="apx-warn" role="status">Could not load: {failed.join(", ")}. The rest of the page is showing normally.</p> : null}
    <div className="apx-kpis">
      {kpis.map((k, i) => <div className="apx-kpi" key={k.label} style={{ "--c": k.color } as React.CSSProperties}>
        <span className="apx-ico"><Icon name={k.icon} /></span>
        <div className="apx-kpi-body"><small>{k.label}</small><strong>{loading ? "…" : k.value}</strong>
          <em className={"apx-chg" + (k.d.chg.dir > 0 ? " is-up" : k.d.chg.dir < 0 ? " is-down" : "")}>{k.d.chg.dir > 0 ? "↑ " : k.d.chg.dir < 0 ? "↓ " : ""}{loading ? "" : k.d.chg.label}</em></div>
        <Spark data={k.d.cur} color={k.color} gid={"apx-s" + i} />
      </div>)}
    </div>
    <div className="apx-row">
      <section className="apx-card apx-traffic">
        <div className="apx-card-head"><span className="apx-badge"><Icon name="bars" /></span><div><h2>Traffic Overview</h2><p>Website page views over time</p></div>
          <div className="apx-legend"><span><i className="is-cur" />This Period</span><span><i className="is-prev" />Previous Period</span></div></div>
        {m.v.total === 0 && !loading ? <p className="apx-note">No page views were recorded in this period yet.</p> : null}
        <TrafficChart cur={m.v.cur} prev={m.v.prev} start={m.start} />
      </section>
      <section className="apx-card apx-pages">
        <div className="apx-card-head"><span className="apx-badge"><Icon name="eye" /></span><div><h2>Top Pages</h2><p>Most visited pages</p></div></div>
        {m.pages.length ? <ol className="apx-toplist">{m.pages.map((p, i) => <li key={p.name}><span className="apx-rank">{i + 1}</span><div><div className="apx-toprow"><strong>{p.name}</strong><b>{p.pct.toFixed(1)}%</b></div><div className="apx-bar"><i style={{ width: `${Math.max(p.pct, 2)}%` }} /></div></div></li>)}</ol> : <p className="apx-note">{loading ? "Loading…" : "No page views in this period yet."}</p>}
      </section>
    </div>
    <div className="apx-row apx-row3">
      <section className="apx-card apx-funnel">
        <div className="apx-card-head"><span className="apx-badge apx-badge-soft"><Icon name="funnel" /></span><div><h2>Application Funnel</h2><p>From interest to paid deal</p></div></div>
        <div className="apx-funnel-body">
          <svg className="apx-funnel-svg" viewBox="0 0 150 184" preserveAspectRatio="none" aria-hidden="true">
            {[[150, 118, "#f0287f"], [118, 86, "#f45a9b"], [86, 54, "#f88ab9"], [54, 28, "#fbb4d2"]].map(([top, bot, fill], i) => {
              const t = top as number, b = bot as number, y0 = i * 46 + (i ? 1.5 : 0), y1 = (i + 1) * 46 - 1.5, cx = 75;
              return <path key={i} d={`M${cx - t / 2},${y0} L${cx + t / 2},${y0} L${cx + b / 2},${y1} L${cx - b / 2},${y1} Z`} fill={fill as string} />;
            })}
          </svg>
          <ul className="apx-funnel-rows">{m.funnel.map((f) => <li key={f.label}><span>{f.label}</span><b>{loading ? "…" : num(f.value)}{f.pct !== null && !loading ? <em> ({f.pct}%)</em> : null}</b></li>)}</ul>
        </div>
        {!loading && m.funnel[0].value === 0 ? <p className="apx-note">No applications were submitted in this period.</p> : null}
      </section>
      <section className="apx-card apx-sales">
        <div className="apx-card-head"><span className="apx-badge apx-badge-soft"><Icon name="cart" /></span><div><h2>Sales Overview</h2><p>Revenue trend</p></div></div>
        <div className="apx-sales-top"><strong>{loading ? "…" : money(m.r.total, m.code)}</strong>{!loading ? <em className={"apx-chg" + (m.r.chg.dir > 0 ? " is-up" : m.r.chg.dir < 0 ? " is-down" : "")}>{m.r.chg.dir > 0 ? "↑ " : m.r.chg.dir < 0 ? "↓ " : ""}{m.r.chg.label}</em> : null}</div>
        {(() => { const max = Math.max(...m.bars.map((b) => b.v), 0); return <div className="apx-bars" role="img" aria-label="Revenue over the selected period">{m.bars.map((b) => <div key={b.label} className="apx-barcol" title={`${b.label}: ${money(b.v, m.code)}`}><div className="apx-barwrap"><i style={{ height: max ? `${Math.max((b.v / max) * 100, b.v > 0 ? 6 : 0)}%` : "0%" }} /></div><span>{b.label}</span></div>)}</div>; })()}
        {!loading && m.r.total === 0 ? <p className="apx-note">No paid store orders in this period.</p> : null}
      </section>
      <section className="apx-card apx-activity">
        <div className="apx-card-head"><span className="apx-badge apx-badge-soft"><Icon name="bolt" /></span><div><h2>Recent Activity</h2><p>Live updates</p></div>
          {m.acts.length > 4 ? <button type="button" className="apx-viewall" onClick={() => setShowAll((s) => !s)}>{showAll ? "Show less" : "View All"} →</button> : null}</div>
        {m.acts.length ? <ol className="apx-acts">{(showAll ? m.acts : m.acts.slice(0, 4)).map((a) => <li key={a.id} className={"is-" + a.kind}><span className="apx-act-ico"><Icon name={a.kind === "app" ? "users" : a.kind === "order" ? "cart" : a.kind === "sub" ? "mail" : "bag"} /></span><div><strong>{a.title}</strong><small>{a.sub}</small></div><time>{ago(a.t, now)}</time></li>)}</ol> : <p className="apx-note">{loading ? "Loading…" : "No activity yet."}</p>}
      </section>
    </div>
  </div>;
}
