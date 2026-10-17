// FILE PATH: src/components/layout/SiteSearch.tsx
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type SearchItem = { title: string; description: string; href: string; keywords?: string };

const SHORTCUTS = [
  { label: "TAP IN", href: "/tap-in" },
  { label: "Work With FK", href: "/work-with-fk" },
  { label: "The Store", href: "/store" },
  { label: "The TAP Journal", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export default function SiteSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [rawResults, setResults] = useState<SearchItem[]>([]);
  const [loadingState, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    const term = query.trim();
    if (!term) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Search unavailable");
        const data = await response.json() as { results?: SearchItem[] };
        setResults(Array.isArray(data.results) ? data.results : []);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query]);

  const hasQuery = query.trim().length > 0;
  const results = hasQuery ? rawResults : [];
  const loading = hasQuery && loadingState;

  return (
    <div className="site-search">
      <button type="button" className="search-button" aria-label={open ? "Close site search" : "Open site search"} aria-expanded={open} aria-controls="site-search-panel" onClick={() => setOpen((value) => !value)}>
        {open ? <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19" strokeLinecap="round" /></svg> : <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.3 4.3" strokeLinecap="round" /></svg>}
      </button>
      {open ? <div id="site-search-panel" className="site-search-panel">
        <form className="site-search-form" role="search" onSubmit={(event) => { event.preventDefault(); if (results[0]) { window.location.assign(results[0].href); setOpen(false); } }}>
          <label className="sr-only" htmlFor="site-search-input">Search The Africa Plug</label>
          <input id="site-search-input" ref={inputRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles, opportunities, resources…" autoComplete="off" />
          <button type="submit" aria-label="Go to the best matching result" disabled={!results.length}>Search <span aria-hidden="true">→</span></button>
        </form>
        <p className="site-search-heading">{query.trim() ? "MATCHING RESULTS" : "EXPLORE THE SITE"}</p>
        {query.trim() ? loading ? <p className="site-search-empty">Searching published content…</p> : results.length ? <nav aria-label="Search results" className="site-search-results">
          {results.map((item) => <Link href={item.href} key={item.href + item.title} onClick={() => setOpen(false)}><span><b>{item.title}</b><small>{item.description}</small></span><span aria-hidden="true" className="site-search-arrow">↗</span></Link>)}
        </nav> : <p className="site-search-empty">No matching published pages or resources. Try “market”, “partnership” or “investment”.</p> : <div className="site-search-shortcuts">
          {SHORTCUTS.map((item) => <Link href={item.href} key={item.href} onClick={() => setOpen(false)}>{item.label} ↗</Link>)}
          <Link href="/contact?type=ask" onClick={() => setOpen(false)}>Ask The Africa Plug ↗</Link>
        </div>}
      </div> : null}
    </div>
  );
}