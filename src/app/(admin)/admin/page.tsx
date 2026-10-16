"use client";

import { useEffect, useState, type FormEvent } from "react";

const areas = [
  { group: "PUBLISHING", items: [
    { title: "Homepage", detail: "Hero slides, imagery and homepage modules", href: "/admin/homepage", mark: "01" },
    { title: "TAP IN opportunities", detail: "Create, review, publish, close and archive listings", href: "/admin/tap-in", mark: "02" },
    { title: "Blog & editorial", detail: "Articles, categories, SEO and sharing metadata", href: "/admin/blog", mark: "03" },
    { title: "Store products", detail: "Products, images, prices and protected files", href: "/admin/store", mark: "04", status: "CMS setup required" },
  ]},
  { group: "BUSINESS OPERATIONS", items: [
    { title: "Work With FK", detail: "Applications, review decisions and commercial settings", href: "/admin/work-with-fk", mark: "05" },
    { title: "Enquiries & forms", detail: "Contact, partnership, Ask TAP and expressions of interest", href: "/admin/enquiries", mark: "06" },
    { title: "Subscribers", detail: "Stay Plugged In audience and newsletter status", href: "/admin/subscribers", mark: "07" },
    { title: "Analytics & funnel", detail: "Sources, UTM data and conversion events", href: "/admin/analytics", mark: "08" },
  ]},
  { group: "SITE CONTROL", items: [
    { title: "Media library", detail: "Reusable image and document assets", href: "/admin/media", mark: "09" },
    { title: "Commercial settings", detail: "Fees, meeting length, terms and booking rules", href: "/admin/settings", mark: "10" },
    { title: "Site & SEO settings", detail: "Navigation, contact links, metadata and optional modules", href: "/admin/site-settings", mark: "11", status: "Settings module required" },
  ]},
];

export default function AdminDashboard() {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Africa Plug Admin — Control Room";
    setAuthenticated(true);
    setReady(true);
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) { setError(data.error || "Sign-in failed."); return; }
      setPassword("");
      setAuthenticated(true);
    } catch { setError("Could not connect to the admin service."); }
    finally { setBusy(false); }
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthenticated(false);
  }

  if (!ready) return <main className="ap-admin"><p>Loading your control room…</p></main>;
  if (!authenticated) return (
    <main className="ap-admin ap-admin-login">
      <div className="ap-admin-login-card">
        <a className="ap-admin-brand" href="/"><span>AP</span><b>THE AFRICA PLUG</b></a>
        <p className="ap-admin-eyebrow">PRIVATE WORKSPACE</p>
        <h1>Welcome back.</h1>
        <p>Sign in to manage the website, opportunities and business enquiries.</p>
        <form onSubmit={signIn}>
          <label htmlFor="admin-password">Admin password</label>
          <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error && <p className="ap-admin-error" role="alert">{error}</p>}
          <button type="submit" disabled={busy}>{busy ? "Signing in…" : "SIGN IN →"}</button>
        </form>
      </div>
    </main>
  );

  return (
    <main className="ap-admin">
      <header className="ap-admin-topbar">
        <a className="ap-admin-brand" href="/"><span>AP</span><b>THE AFRICA PLUG</b></a>
        <div className="ap-admin-top-actions"><span><i /> ADMIN WORKSPACE</span><a href="/">View website ↗</a></div>
      </header>
      <section className="ap-admin-hero">
        <p className="ap-admin-eyebrow">THE AFRICA PLUG · CONTROL ROOM</p>
        <h1>Everything in<br/><em>one place.</em></h1>
        <p className="ap-admin-lede">Manage the parts of the business that change. Publish only real content, keep enquiries traceable and control the customer journey from one workspace.</p>
        <div className="ap-admin-shortcuts">
          <a href="/admin/homepage">Edit homepage <span>↗</span></a>
          <a href="/admin/tap-in">Manage TAP IN <span>↗</span></a>
          <a href="/admin/review-required">Review required <span>↗</span></a>
        </div>
      </section>
      {areas.map((area) => (
        <section className="ap-admin-area" key={area.group}>
          <div className="ap-admin-area-heading"><p>{area.group}</p><span>{String(area.items.length).padStart(2, "0")} MODULES</span></div>
          <div className="ap-admin-grid">
            {area.items.map((item) => (
              <a className="ap-admin-card" href={item.href} key={item.title}>
                <span className="ap-admin-card-number">{item.mark}</span>
                <div><h2>{item.title}<span aria-hidden="true">↗</span></h2><p>{item.detail}</p></div>
                <small className="ap-admin-status">OPEN MODULE</small>
              </a>
            ))}
          </div>
        </section>
      ))}
      <footer className="ap-admin-footer"><span>THE AFRICA PLUG · ADMIN</span><a href="/">View public website ↗</a><span>Light, clear, accountable.</span></footer>
    </main>
  );
}
