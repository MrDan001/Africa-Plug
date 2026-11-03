// FILE PATH: src/components/tap-in/TapInBoard.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  TYPE_FILTERS,
  altText,
  blurb,
  metaLine,
  typeGroup,
  type PublicListing,
} from "@/lib/tap-in/public";
import { AlertsSignup, ExpressInterestDialog, RegisterInterestDialog, SubmitOpportunityDialog } from "./TapInDialogs";
import { COUNTRIES } from "@/lib/work-with-fk/application-schema";

const DISCLAIMER = "Listings are shared for information only and are not an offer, recommendation or endorsement. Carry out your own due diligence before entering any agreement.";

// The open listing lives in the URL hash (/tap-in#excavator-hire-west-africa), so every opportunity has its own shareable link.
function subscribeHash(notify: () => void) {
  window.addEventListener("hashchange", notify);
  window.addEventListener("popstate", notify);
  return () => { window.removeEventListener("hashchange", notify); window.removeEventListener("popstate", notify); };
}
const readHash = () => { try { return decodeURIComponent(window.location.hash.slice(1)); } catch { return ""; } };

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" className={`ti-chip${active ? " is-active" : ""}`} aria-pressed={active} onClick={onClick}>{children}</button>;
}

function ShareIcon({ name }: { name: "whatsapp" | "linkedin" | "link" }) {
  if (name === "whatsapp") return <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#25d366" /><path fill="#fff" d="M17 14.3c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.5.1l-.7.9c-.1.1-.3.2-.5.1-1.200-.6-2-1.100-2.800-2.400-.2-.4.200-.4.600-1.200.1-.1 0-.3 0-.4l-.7-1.600c-.2-.4-.3-.4-.5-.4h-.4c-.1 0-.4.100-.6.300-.2.300-.8.800-.8 1.900 0 1.100.8 2.200.9 2.300.1.200 1.600 2.500 3.900 3.500 1.400.6 2 .6 2.700.5.4-.1 1.300-.5 1.500-1.100.2-.5.2-1 .1-1.100 0-.1-.2-.2-.4-.3Z" /></svg>;
  if (name === "linkedin") return <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="3" fill="#0a66c2" /><path fill="#fff" d="M6.500 9.500h2.700V18H6.500V9.500ZM7.800 5.500a1.600 1.600 0 1 1 0 3.200 1.600 1.600 0 0 1 0-3.200ZM10.800 9.500h2.600v1.200c.4-.7 1.300-1.400 2.700-1.400 2.800 0 3.300 1.800 3.300 4.200V18h-2.700v-4c0-1 0-2.200-1.400-2.200s-1.600 1-1.600 2.100V18h-2.700V9.500Z" /></svg>;
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1" /><path d="M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1" /></svg>;
}

// Real Africa outline (simplified), drawn with a hand-sketched look: a wobbly double pen line, light pencil hatching and dotted routes between cities.
const AFRICA_OUTLINE =
  "M132.4,109.5L131.4,112.2L131.6,113.4L133,114.2L133,114.8L132.4,116.1L132.5,116.7L132.4,117.8L133.2,119.1L134.1,121.3L134.8,121.8L135.2,122.8L135.1,124.9L135.4,126.9L135.4,130.3L135.8,131.4L135.2,133L134.3,134.6L133,136L131,136.8L128.6,137.9L126.1,140.4L125.3,140.8L123.8,142.4L122.9,142.9L122.7,144.6L123.8,146.3L124.2,147.7L124.2,148.4L124.6,148.2L124.5,150.5L124.2,151.6L124.7,152L124.4,153L123.5,153.9L121.7,154.6L119.1,155.9L118.2,156.8L118.3,157.8L118.9,158L118.7,159.3L118.2,161L117.9,163L117.4,164.2L115.9,165.4L115.5,165.8L114.6,167L114,168.3L112.7,170.1L110.3,172.7L108.8,174.2L107.1,175.4L104.9,176.4L103.8,176.5L103.5,177.3L102.2,176.9L101.1,177.4L98.8,176.9L97.5,177.2L96.6,177.1L94.4,178.1L92.5,178.5L91.2,179.5L90.2,179.5L89.3,178.6L88.6,178.6L87.7,177.4L87.6,177.8L87.3,177.1L87.3,175.5L86.6,173.8L87.3,173.4L87.2,171.4L85.8,169.1L84.7,166.9L84.7,166.9L83.2,163.7L81.6,161.9L80.7,160.1L80.3,157.8L79.7,156L79,152.4L79,149.6L78.7,148.3L77.9,147.3L76.7,145.4L75.6,142.7L75.1,141.2L73.4,139L73.3,137.3L73.1,135.9L73.3,133.9L74.1,131.9L74.2,130.9L74.9,128.9L75.4,128L76.7,126.5L77.4,125.6L77.6,123.9L77.5,122.7L76.8,121.9L76.2,120.6L75.7,119.3L75.8,118.8L76.5,117.9L75.8,115.8L75.4,114.4L74.3,113L74.5,112.6L74.2,111.9L73.6,110.3L71.9,108L69.7,105.8L68.2,104L66.9,101.8L67,101.1L67.5,100.4L68,98.8L68.4,97.3L68,96.9L68.8,94.5L69.1,92.8L68.2,91.4L67.3,91L66.8,90L66.3,89.7L66.3,89.1L64,89.9L63.2,89.8L62.4,90.3L60.7,90.2L59.5,88.9L58.8,87.3L57.3,85.9L55.7,85.9L53.8,85.9L52,86.2L50.3,86.6L46.9,87.9L45.7,88.6L43.7,89.3L41.8,88.6L41.9,87.8L41,85.9L41.5,83.5L42.5,81.7L41.9,78.6L40.4,78L39.4,78.1L38.6,78.6L37.7,78.2L37.3,77.4L36.3,77L35.4,77.3L34.9,77.6L34.6,76.6L34,76.9L33.6,76.8L33.2,77.5L31.5,77.4L31,77.1L30.7,77.3L30.2,77.5L30.1,78.2L30.6,79.1L31.1,80.9L30.3,81.1L30.1,81.4L30.3,81.9L30.1,82.8L29.8,82.8L29.7,83.4L29.9,84.5L29.4,85.5L30.1,86.1L30.7,86.2L31.7,87.1L31.7,88L31.5,88.2L31.4,90L30.8,90L28.6,89L26.6,87.4L24.8,86.2L23.3,84.8L22.7,84.6L21.2,83.7L20.1,82.6L19.7,81.8L19.4,80.2L18.5,78.9L17.6,78L17.1,77.7L16.6,77.3L16.3,76.3L16,75.8L15.4,75.5L14.2,74.6L13.3,74.4L12.8,73.8L12.8,73.5L12.2,73L12,72.5L11.7,70.8L12,69.9L11.1,68.1L10,67.3L10.9,66.9L12,65.3L12.5,64.2L12.3,63L12.9,61.9L13.2,59.7L12.9,57.5L12.7,56.4L12.9,55.2L12.3,54.1L11.2,53.1L11.3,52.2L11.4,51.1L12.2,50.4L12.9,49.2L12.8,48.4L13.5,46.8L14.7,45.3L15.5,44.9L16,43.5L16.1,42.2L16.9,40.8L18.3,39.9L19.7,37.4L19.7,37.4L20.8,36.4L22.8,36.2L24.5,34.5L25.6,33.8L27.4,31.8L26.8,28.7L27.6,26.5L27.9,25.1L29.3,23.4L31.5,22.2L33.1,21.2L34.5,18.4L35.2,16.8L36.8,16.8L38.1,18L40.1,17.8L42.4,18.4L43.3,18.4L45.4,16.9L47.7,16.5L49.1,15.4L51.1,14.6L54.8,14.1L58.3,13.9L59.4,14.3L61.5,13.2L63.8,13.2L64.6,13.8L66.1,13.7L68.5,12.6L70,12.9L69.9,14.2L71.7,13.3L71.9,13.8L70.8,15.1L70.8,16.3L71.5,17L71.3,19.3L69.8,20.6L70.3,22L71.4,22L71.9,23.3L72.7,23.7L75.3,24.6L76.2,24.3L78,24.8L80.8,25.9L81.8,28.2L83.8,28.7L86.8,29.7L89.1,30.9L90.1,30.3L91.2,29.1L90.7,27.2L91.4,26L92.9,24.8L94.4,24.4L97.3,25L98,26.1L98.8,26.1L99.5,26.5L101.7,26.8L102.2,27.7L105.1,27.6L107.1,28.3L109.3,29.1L110.3,29.4L111.9,28.6L112.8,27.9L114.7,27.7L116.3,28L116.8,29.3L117.3,28.5L119.1,29.1L120.7,29.2L121.8,28.6L123,32.2L123.2,32.9L122.6,33.8L122.1,35.7L121.6,37L121.1,37.4L120.3,36.6L119.4,35.5L117.8,32L117.6,32.2L118.5,34.8L119.8,37.3L121.5,41L122.2,42.3L122.9,43.7L124.9,46.3L124.4,46.7L124.5,48.2L127,50.3L127.4,50.8L128.1,53.1L127.6,53.5L127.9,55.9L128.7,58.6L129.6,59.2L130.7,60L132,62.6L132.6,64.7L133.8,65.8L136.7,67.9L137.9,69.1L139.1,70.4L139.7,71.2L140.8,71.8L140.1,72.4L139.2,72.2L138.5,73.2L137.7,74.2L137.9,74.8L137.9,75.5L139.1,75.5L139.7,75.3L140.1,75.7L139.7,76.5L140.5,77.7L141.3,78.8L142.1,79.6L149.1,82.1L150.9,82.1L152.4,80.3L153.4,79L153.4,77.8L153.4,75.6L153.4,74.7L153.4,74.7L154.1,74.6L155.1,74.3L156.3,74.1L157.3,73.3L158.1,73.3L158.1,73.9L158,75.2L158,76.4L157.5,77.2L156.9,79.5L155.9,82L154.5,84.7L152.7,87.9L150.8,90.3L148.3,93.3L146.1,95L142.9,97.2L140.9,98.8L138.6,101.4L138.1,102.5L137.6,103.1L136.1,103.9L135.5,104.8L134.7,105L134.4,106.5L133.7,107.4L133.3,108.8ZM113.2,133.3L111.6,133.6L110.3,134.5L110.1,135.2L109.3,135.4L107.4,137.3L106.2,138.7L105.5,138.8L104.8,138.5L102.4,138.3L103.2,140.1L103.7,140.5L104.3,141.8L106.8,144.3L107.7,144.6L107.7,145.4L108.3,146.8L110,147.2L111.4,148.2L112.3,148.3L113.3,148.7L114,148.4L115.2,148.6L117.4,146L118,144.3L118.3,144.1L118.6,142.8L118.2,142.1L118.3,140.4L118.7,138.8L118.7,136L117.6,135.2L116.6,135.1L116.1,134.5L115.1,134L113.3,134.1ZM154.7,126.5L155.3,127.4L155.8,128.9L156.2,131.6L156.7,132.6L156.5,133.7L156.1,134.4L155.4,133L155,133.7L155.4,135.4L155.2,136.3L154.6,136.8L154.5,138.8L153.6,141.4L152.6,144.6L151.2,148.9L150.4,152.2L149.4,154.9L147.7,155.5L145.8,156.5L144.6,155.9L142.9,155.1L142.3,153.8L142.1,151.7L141.4,149.8L141.2,148.2L141.6,146.5L142.5,146.1L142.6,145.3L143.6,143.6L143.8,142.1L143.3,141L142.9,139.6L142.7,137.5L143.4,136.3L143.7,134.8L144.8,134.8L146,134.3L146.8,133.9L147.8,133.9L149,132.6L150.8,131.2L151.4,130.1L151.1,129.1L152,129.4L153.2,127.9L153.3,126.5L154,125.6Z";

function AfricaMap() {
  return (
    <svg className="ti-map" viewBox="0 0 210 236" fill="none" aria-hidden="true">
      <defs>
        <filter id="ti-sketch" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <pattern id="ti-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="#cfcac0" strokeWidth=".7" />
        </pattern>
        <clipPath id="ti-clip"><path d={AFRICA_OUTLINE} /></clipPath>
      </defs>

      <g filter="url(#ti-sketch)" strokeLinejoin="round" strokeLinecap="round">
        {/* pencil hatching inside the continent */}
        <rect width="210" height="236" fill="url(#ti-hatch)" clipPath="url(#ti-clip)" opacity=".55" />
        {/* two slightly offset pen passes give the hand-drawn outline */}
        <path d={AFRICA_OUTLINE} stroke="#9d988d" strokeWidth="1.4" />
        <path d={AFRICA_OUTLINE} stroke="#c4bfb4" strokeWidth=".9" transform="translate(.9 .7) rotate(.4 105 118)" />
      </g>

      <g stroke="#d51f6d" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1.5 4" opacity=".85">
        <path d="M55 85C72 66 98 52 115 32" />
        <path d="M55 85C68 78 82 74 98 73" opacity="0" />
        <path d="M55 85C40 84 24 78 11 67" />
        <path d="M55 85C80 84 106 92 127 102" />
        <path d="M127 102C130 124 122 142 108 158" />
      </g>
      <g fill="#d51f6d">
        <circle cx="55" cy="85" r="4" /><circle cx="115" cy="32" r="3.2" /><circle cx="11" cy="67" r="3.2" /><circle cx="127" cy="102" r="3.2" /><circle cx="108" cy="158" r="3.2" />
      </g>
      <circle cx="55" cy="85" r="8" stroke="#d51f6d" strokeWidth=".8" opacity=".45" />
    </svg>
  );
}

export default function TapInBoard({ listings }: { listings: PublicListing[] }) {
  const [type, setType] = useState("");
  const [sector, setSector] = useState("");
  const [dialog, setDialog] = useState<"interest" | "register" | "submit" | null>(null);
  const [copied, setCopied] = useState(false);
  const hash = useSyncExternalStore(subscribeHash, readHash, () => "");
  const closeRef = useRef<HTMLButtonElement>(null);

  const selected = useMemo(() => listings.find((item) => item.slug === hash) ?? null, [listings, hash]);
  const sectors = useMemo(
    () => Array.from(new Set(listings.filter((item) => item.open).map((item) => item.sector.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [listings],
  );
  // Newest first (the server already sorted), with Open listings ahead of Closed ones.
  const visible = useMemo(() => {
    const matches = listings.filter((item) =>
      (!type || typeGroup(item.opportunity_type) === type) &&
      (!sector || item.sector.trim() === sector));
    return [...matches.filter((item) => item.open), ...matches.filter((item) => !item.open)];
  }, [listings, type, country, sector]);
  const anyFilter = Boolean(type || country || sector);
  const hasOpen = listings.some((item) => item.open);

  const openListing = useCallback((slug: string) => { window.location.hash = slug; }, []);
  const closePanel = useCallback(() => {
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    window.dispatchEvent(new Event("hashchange"));
  }, []);

  // Panel: Escape closes it, the page behind stays put, and focus moves to the close button.
  useEffect(() => {
    if (!selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") closePanel(); };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", onKey); };
  }, [selected, closePanel]);

  const shareUrl = selected && typeof window !== "undefined" ? `${window.location.origin}/tap-in#${selected.slug}` : "";
  async function copyLink() {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 2000); }
    catch { window.prompt("Copy this link:", shareUrl); }
  }

  return (
    <>
      <section className="ti-listings" aria-labelledby="ti-listings-h2">
        <div className="ti-wrap">
          <p className="ti-label">OPPORTUNITIES</p>
          <h2 id="ti-listings-h2">Current opportunities in Africa.</h2>
          <p className="ti-sub">Explore live business and investment opportunities from across the continent.</p>

          <div className="ti-filters" aria-label="Filter opportunities">
            <label className="ti-filter-select">Type
              <select value={type} onChange={(event) => setType(event.target.value)}>
                <option value="">All types</option>
                {TYPE_FILTERS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="ti-filter-select">Country
              <select value={country} onChange={(event) => setCountry(event.target.value)}>
                <option value="">All countries</option>
                {COUNTRIES.filter((item) => item !== "Other").map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="ti-filter-select">Sector
              <select value={sector} onChange={(event) => setSector(event.target.value)}>
                <option value="">All sectors</option>
                {sectors.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>

          {visible.length ? (
            <div className="ti-grid">
              {visible.map((item) => (
                <a key={item.id} href={`#${item.slug}`} className={`ti-card${item.open ? "" : " is-closed"}`} onClick={(event) => { event.preventDefault(); openListing(item.slug); }}>
                  <div className="ti-card-media">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt={altText(item)} loading="lazy" />
                    ) : <span className="ti-card-noimg" aria-hidden="true" />}
                    <span className={`ti-pill ${item.open ? "is-open" : "is-closed"}`}>{item.open ? "Open" : "Closed"}</span>
                  </div>
                  <div className="ti-card-body">
                    <h3>{item.title}</h3>
                    <p className="ti-card-meta">{metaLine(item)}</p>
                    <p className="ti-card-desc">{blurb(item.description)}</p>
                    <span className="ti-card-cta">VIEW OPPORTUNITY <span aria-hidden="true">→</span></span>
                  </div>
                </a>
              ))}
            </div>
          ) : listings.length && anyFilter ? (
            <div className="ti-empty">
              <h3>No opportunities match those filters.</h3>
              <button type="button" className="ti-link" onClick={() => { setType(""); setCountry(""); setSector(""); }}>Clear filters</button>
            </div>
          ) : (
            <div className="ti-empty"><h3>No live opportunities right now.</h3><p>New opportunities are on the way. Tell us what you’re looking for below.</p></div>
          )}
        </div>
      </section>

      <section className="ti-band ti-band-stone" aria-labelledby="ti-register-h2">
        <div className="ti-wrap ti-band-inner">
          <div className="ti-band-copy">
            <p className="ti-label">{hasOpen ? "NOT FINDING WHAT YOU’RE LOOKING FOR?" : "NO LIVE OPPORTUNITIES RIGHT NOW"}</p>
            <h2 id="ti-register-h2">New opportunities are on the way. Tell us what you’re looking for.</h2>
            <p>Register your interest and let us know the type of opportunities that would be relevant to you. We’ll keep you updated as new listings go live.</p>
            <button type="button" className="ti-btn ti-btn-primary" onClick={() => setDialog("register")}>REGISTER YOUR INTEREST <span aria-hidden="true">→</span></button>
          </div>
          <AfricaMap />
        </div>
      </section>

      <section className="ti-band ti-band-white" aria-labelledby="ti-submit-h2">
        <div className="ti-wrap ti-submit">
          <div>
            <p className="ti-label">SUBMIT AN OPPORTUNITY</p>
            <h2 id="ti-submit-h2">HAVE AN OPPORTUNITY TO PUT FORWARD?</h2>
          </div>
          <div className="ti-submit-copy">
            <p>A business, product or project looking for the right commercial partner? Send The Africa Plug the details for consideration. We’ll review and may feature it on TAP IN.</p>
            <button type="button" className="ti-btn ti-btn-primary" onClick={() => setDialog("submit")}>SUBMIT AN OPPORTUNITY <span aria-hidden="true">→</span></button>
          </div>
        </div>
      </section>

      <section className="ti-band ti-band-alerts" aria-labelledby="ti-alerts-h2">
        <div className="ti-wrap ti-alerts">
          <div>
            <p className="ti-label">OPPORTUNITY ALERTS</p>
            <h2 id="ti-alerts-h2">Get new opportunities first.</h2>
          </div>
          <AlertsSignup />
        </div>
      </section>

      <p className="ti-disclaimer ti-wrap">{DISCLAIMER} <a href="/terms">See our Terms.</a></p>

      {selected ? (
        <>
          <div className="ti-overlay" onClick={closePanel} aria-hidden="true" />
          <aside className="ti-panel" role="dialog" aria-modal="true" aria-labelledby="ti-panel-title">
            <button ref={closeRef} type="button" className="ti-panel-close" aria-label="Close opportunity" onClick={closePanel}>×</button>
            {selected.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={`ti-panel-img${selected.open ? "" : " is-closed"}`} src={selected.image_url} alt={altText(selected)} />
            ) : null}
            <div className="ti-panel-body">
              <div className="ti-panel-head">
                <h2 id="ti-panel-title">{selected.title}</h2>
                <span className={`ti-pill ${selected.open ? "is-open" : "is-closed"}`}>{selected.open ? "Open" : "Closed"}</span>
              </div>
              <p className="ti-panel-meta">{metaLine(selected)}</p>

              <h3>What’s on offer</h3>
              <p className="ti-panel-text">{selected.description}</p>
              <h3>What’s needed</h3>
              <p className="ti-panel-text">{selected.who_this_is_for}</p>
              <h3>How to enquire</h3>
              {selected.open ? (
                <>
                  <p className="ti-panel-text">Click the button below to express your interest. We’ll share your details with the opportunity owner and facilitate an introduction.</p>
                  <button type="button" className="ti-btn ti-btn-primary" onClick={() => setDialog("interest")}>EXPRESS INTEREST <span aria-hidden="true">→</span></button>
                </>
              ) : (
                <p className="ti-panel-text">This opportunity is closed and is no longer taking interest. Register your interest below to hear about similar opportunities.</p>
              )}
              <p className="ti-fine">{DISCLAIMER}</p>

              <h3>Share this opportunity</h3>
              <div className="ti-share">
                <a href={`https://wa.me/?text=${encodeURIComponent(`${selected.title} ${shareUrl}`)}`} target="_blank" rel="noopener noreferrer"><ShareIcon name="whatsapp" /> WhatsApp</a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"><ShareIcon name="linkedin" /> LinkedIn</a>
                <button type="button" onClick={() => void copyLink()}><ShareIcon name="link" /> {copied ? "Copied" : "Copy Link"}</button>
              </div>

              <div className="ti-expert">
                <p>Want an expert read on an opportunity before you commit?</p>
                <a href="/work-with-fk">Work With FK <span aria-hidden="true">→</span></a>
              </div>
            </div>
          </aside>
        </>
      ) : null}

      {dialog === "interest" && selected ? <ExpressInterestDialog listing={selected} onClose={() => setDialog(null)} /> : null}
      {dialog === "register" ? <RegisterInterestDialog onClose={() => setDialog(null)} /> : null}
      {dialog === "submit" ? <SubmitOpportunityDialog onClose={() => setDialog(null)} /> : null}
    </>
  );
}