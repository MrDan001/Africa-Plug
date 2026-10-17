"use client";

import { useMemo, useState } from "react";

export type PublicTapInOpportunity = {
  id: string;
  slug: string;
  title: string;
  country: string;
  region: string;
  sector: string;
  opportunity_type: string;
  description: string;
  who_this_is_for: string;
  image_url: string | null;
};

type Props = { opportunities: PublicTapInOpportunity[]; filterThreshold?: number };

function choices(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export default function TapInListings({ opportunities, filterThreshold = 6 }: Props) {
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");
  const [sector, setSector] = useState("");
  const [opportunityType, setOpportunityType] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const showFilters = opportunities.length >= Math.min(100, Math.max(1, Math.floor(filterThreshold)));

  const regions = useMemo(() => choices(opportunities.map((item) => item.region)), [opportunities]);
  const countries = useMemo(() => choices(opportunities.map((item) => item.country)), [opportunities]);
  const sectors = useMemo(() => choices(opportunities.map((item) => item.sector)), [opportunities]);
  const opportunityTypes = useMemo(() => choices(opportunities.map((item) => item.opportunity_type)), [opportunities]);
  const filtered = useMemo(() => opportunities.filter((item) =>
    (!region || item.region === region) &&
    (!country || item.country === country) &&
    (!sector || item.sector === sector) &&
    (!opportunityType || item.opportunity_type === opportunityType)
  ), [opportunities, region, country, sector, opportunityType]);
  const activeCount = [region, country, sector, opportunityType].filter(Boolean).length;

  function clearFilters() {
    setRegion("");
    setCountry("");
    setSector("");
    setOpportunityType("");
  }

  if (!opportunities.length) {
    return <div className="standard-note">
      <span className="standard-note-mark" aria-hidden="true">↗</span>
      <div>
        <h3>No current opportunities to display.</h3>
        <p>Listings will appear here when genuine opportunities have been reviewed and approved for publication.</p>
      </div>
      <a href="/contact?type=ask">Ask The Africa Plug <span aria-hidden="true">→</span></a>
    </div>;
  }

  return <>
    {showFilters ? <section className="tap-in-filter-shell" aria-label="Filter TAP IN opportunities">
      <div className="tap-in-filter-heading">
        <p className="standard-eyebrow">FIND A RELEVANT OPPORTUNITY</p>
        <button type="button" className="tap-in-filter-toggle" aria-expanded={mobileFiltersOpen} aria-controls="tap-in-filter-panel" onClick={() => setMobileFiltersOpen((open) => !open)}>
          {mobileFiltersOpen ? "Hide filters" : "Filters"}{activeCount ? ` (${activeCount})` : ""} <span aria-hidden="true">{mobileFiltersOpen ? "−" : "+"}</span>
        </button>
      </div>
      <div id="tap-in-filter-panel" className={`tap-in-filter-panel ${mobileFiltersOpen ? "is-open" : ""}`}>
        <label>Region
          <select value={region} onChange={(event) => setRegion(event.target.value)}>
            <option value="">All regions</option>{regions.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label>Country
          <select value={country} onChange={(event) => setCountry(event.target.value)}>
            <option value="">All countries</option>{countries.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label>Sector
          <select value={sector} onChange={(event) => setSector(event.target.value)}>
            <option value="">All sectors</option>{sectors.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label>Opportunity type
          <select value={opportunityType} onChange={(event) => setOpportunityType(event.target.value)}>
            <option value="">All types</option>{opportunityTypes.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        {activeCount ? <button className="tap-in-filter-clear" type="button" onClick={clearFilters}>Clear filters</button> : null}
      </div>
      <p className="tap-in-filter-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? "opportunity" : "opportunities"}</p>
    </section> : null}

    {filtered.length ? <div className="standard-card-grid">
      {filtered.map((item) => <article className="standard-card tap-in-opportunity-card" key={item.id}>
        {item.image_url ? <div className="tap-in-opportunity-image" role="img" aria-label={`Image for ${item.title}`} style={{ backgroundImage: `url("${item.image_url}")` }} /> : null}
        <p className="standard-card-category">{[item.sector, item.opportunity_type].filter(Boolean).join(" · ")}</p>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        {(item.country || item.region) ? <p className="standard-card-category">{[item.country, item.region].filter(Boolean).join(" · ")}</p> : null}
        <p><strong>Who this is for:</strong> {item.who_this_is_for}</p>
        <a className="text-link" href={`/tap-in/${item.slug}`}>VIEW OPPORTUNITY <span aria-hidden="true">→</span></a>
      </article>)}
    </div> : <div className="standard-note"><div><h3>No opportunities match those filters.</h3><p>Clear one or more filters to see other current opportunities.</p></div><button type="button" className="tap-in-filter-clear" onClick={clearFilters}>Clear filters</button></div>}
  </>;
}
