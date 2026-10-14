"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type SearchItem = {
  title: string;
  description: string;
  href: string;
  keywords: string;
};

const SEARCH_ITEMS: SearchItem[] = [
  { title: "Home", description: "Return to The Africa Plug homepage.", href: "/", keywords: "homepage start welcome" },
  { title: "Discover Africa", description: "Business, culture, travel, people and places.", href: "/#discover", keywords: "discover countries culture travel lifestyle media" },
  { title: "TAP IN", description: "Explore opportunities and ways to get involved.", href: "/tap-in", keywords: "opportunities listings business investment" },
  { title: "Work With FK", description: "Commercial consulting and market navigation.", href: "/work-with-fk", keywords: "consulting commercial business investment services" },
  { title: "Store / Bookshelf", description: "Browse practical guides, workbooks and playbooks.", href: "/store", keywords: "store shop books buy pay guide workbook toolkit" },
  { title: "The Africa Starter Guide", description: "A starting point for understanding African markets.", href: "/store#book-the-africa-starter-guide", keywords: "book field guide markets africa" },
  { title: "Doing Business in Nigeria", description: "Local business culture, market entry and relationships.", href: "/store#book-doing-business-in-nigeria", keywords: "book nigeria business market playbook" },
  { title: "The Opportunity Mapping Workbook", description: "Compare opportunities and spot missing information.", href: "/store#book-the-opportunity-mapping-workbook", keywords: "book workbook opportunity map" },
  { title: "Partnerships That Work", description: "Find aligned partners and build lasting relationships.", href: "/store#book-partnerships-that-work", keywords: "book partnerships guide relationships" },
  { title: "The African Market Research Toolkit", description: "Organise research and test assumptions.", href: "/store#book-the-african-market-research-toolkit", keywords: "book research toolkit markets" },
  { title: "Export Ready: A Starter Workbook", description: "Questions around export readiness, buyers and logistics.", href: "/store#book-export-ready-a-starter-workbook", keywords: "book export workbook logistics buyers" },
  { title: "The Deal Preparation Checklist", description: "Prepare conversations, documents and next steps.", href: "/store#book-the-deal-preparation-checklist", keywords: "book deal checklist documents" },
  { title: "Understanding African Supply Chains", description: "Assess suppliers, routes and delivery risks.", href: "/store#book-understanding-african-supply-chains", keywords: "book supply chain suppliers logistics risk" },
  { title: "From Idea to Market: Africa Edition", description: "Turn an early idea into a testable plan.", href: "/store#book-from-idea-to-market-africa-edition", keywords: "book market entry ideas startup" },
  { title: "The Investor's First Questions", description: "Due diligence prompts and evidence to request.", href: "/store#book-the-investors-first-questions", keywords: "book investor investment due diligence" },
  { title: "Blog", description: "Read stories and perspectives from across Africa.", href: "/blog", keywords: "journal articles stories media" },
  { title: "About The Africa Plug", description: "Learn about the platform and what it does.", href: "/about", keywords: "company about mission" },
  { title: "Contact", description: "Get in touch with The Africa Plug.", href: "/contact", keywords: "email ask question contact support" },
  { title: "Privacy Policy", description: "How personal information is handled.", href: "/privacy", keywords: "privacy data personal information" },
  { title: "Terms of Use", description: "Rules for using this website and its content.", href: "/terms", keywords: "terms conditions legal" },
  { title: "Cookie Policy", description: "How cookies and similar technologies are used.", href: "/cookies", keywords: "cookies consent preferences tracking" },
  { title: "Refunds Policy", description: "Information about cancellations and refunds.", href: "/refunds", keywords: "refunds returns cancellation digital products" },
];

export default function SiteSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return SEARCH_ITEMS
      .map((item) => {
        const title = item.title.toLowerCase();
        const description = item.description.toLowerCase();
        const keywords = item.keywords.toLowerCase();
        const score = title === term ? 5 : title.startsWith(term) ? 4 : title.includes(term) ? 3 : keywords.includes(term) ? 2 : description.includes(term) ? 1 : 0;
        return { item, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
      .slice(0, 6)
      .map((entry) => entry.item);
  }, [query]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (results[0]) window.location.assign(results[0].href);
  }

  return (
    <div className="site-search">
      <button
        type="button"
        className="search-button"
        aria-label={open ? "Close site search" : "Open site search"}
        aria-expanded={open}
        aria-controls="site-search-panel"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? (
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="m5 5 14 14M19 5 5 19" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.3 4.3" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div id="site-search-panel" className="site-search-panel">
          <form className="site-search-form" role="search" onSubmit={submitSearch}>
            <label className="sr-only" htmlFor="site-search-input">Search The Africa Plug</label>
            <input
              id="site-search-input"
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search guides, markets, opportunities…"
              autoComplete="off"
            />
            <button type="submit" aria-label="Go to the best matching result">Search <span aria-hidden="true">→</span></button>
          </form>
          <p className="site-search-heading">{query.trim() ? "MATCHING RESULTS" : "POPULAR DESTINATIONS"}</p>
          {query.trim() ? (
            results.length ? (
              <nav aria-label="Search results" className="site-search-results">
                {results.map((item) => (
                  <Link href={item.href} key={item.title} onClick={() => setOpen(false)}>
                    <span><b>{item.title}</b><small>{item.description}</small></span>
                    <span aria-hidden="true" className="site-search-arrow">↗</span>
                  </Link>
                ))}
              </nav>
            ) : (
              <p className="site-search-empty">No matching pages or resources yet. Try “store”, “Nigeria”, “investment” or “partnerships”.</p>
            )
          ) : (
            <div className="site-search-shortcuts">
              {[
                { label: "Store", href: "/store" },
                { label: "TAP IN", href: "/tap-in" },
                { label: "Work With FK", href: "/work-with-fk" },
                { label: "Contact", href: "/contact" },
              ].map((item) => <Link href={item.href} key={item.href} onClick={() => setOpen(false)}>{item.label} ↗</Link>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
