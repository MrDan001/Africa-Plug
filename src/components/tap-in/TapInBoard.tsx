// FILE PATH: src/components/tap-in/TapInBoard.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  REGION_FILTERS,
  TYPE_FILTERS,
  altText,
  blurb,
  metaLine,
  regionGroup,
  typeGroup,
  type PublicListing,
} from "@/lib/tap-in/public";
import { AlertsSignup, ExpressInterestDialog, RegisterInterestDialog, SubmitOpportunityDialog } from "./TapInDialogs";

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

function AfricaMap() {
  return (
    <svg className="ti-map" viewBox="0 0 220 240" fill="none" aria-hidden="true">
      <path d="M62 20 84 12l22 8 24 3 20 12 22 14 8 16 10 18 12 18-10 14-18 2-8 18-8 22-6 22-16 20-16 10-12-6-4-22-8-26-18-14-20-8-14-20-8-24 6-24 12-22 14-20Z" stroke="#c9c5bc" strokeWidth="1.2" strokeLinejoin="round" />
      <ellipse cx="182" cy="176" rx="5" ry="14" transform="rotate(14 182 176)" stroke="#c9c5bc" strokeWidth="1.2" />
      <g stroke="#d51f6d" strokeWidth="1" strokeDasharray="2 3" opacity=".65">
        <path d="M58 70C84 66 110 74 126 96" /><path d="M126 96C146 104 160 90 170 74" /><path d="M126 96C134 120 124 146 112 168" /><path d="M112 168C132 172 150 160 160 138" />
      </g>
      <g fill="#d51f6d"><circle cx="58" cy="70" r="3" /><circle cx="126" cy="96" r="3" /><circle cx="170" cy="74" r="3" /><circle cx="112" cy="168" r="3" /><circle cx="160" cy="138" r="3" /></g>
    </svg>
  );
}

export default function TapInBoard({ listings }: { listings: PublicListing[] }) {
  const [type, setType] = useState("");
  const [region, setRegion] = useState("");
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
      (!region || regionGroup(item.region) === region) &&
      (!sector || item.sector.trim() === sector));
    return [...matches.filter((item) => item.open), ...matches.filter((item) => !item.open)];
  }, [listings, type, region, sector]);
  const anyFilter = Boolean(type || region || sector);
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

          <div className="ti-filters" role="group" aria-label="Filter opportunities">
            <div className="ti-filter-group">
              <span className="ti-filter-label">Type:</span>
              <Chip active={!type} onClick={() => setType("")}>All</Chip>
              {TYPE_FILTERS.map((item) => <Chip key={item} active={type === item} onClick={() => setType(item)}>{item}</Chip>)}
            </div>
            <div className="ti-filter-group">
              <span className="ti-filter-label">Region:</span>
              <Chip active={!region} onClick={() => setRegion("")}>All</Chip>
              {REGION_FILTERS.map((item) => <Chip key={item} active={region === item} onClick={() => setRegion(item)}>{item}</Chip>)}
            </div>
            {sectors.length ? (
              <div className="ti-filter-group">
                <span className="ti-filter-label">Sector:</span>
                <Chip active={!sector} onClick={() => setSector("")}>All</Chip>
                {sectors.map((item) => <Chip key={item} active={sector === item} onClick={() => setSector(item)}>{item}</Chip>)}
              </div>
            ) : null}
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
              <button type="button" className="ti-link" onClick={() => { setType(""); setRegion(""); setSector(""); }}>Clear filters</button>
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