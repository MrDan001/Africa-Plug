// FILE PATH: src/components/admin/TapInManager.tsx
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import BrandLogo from "@/components/layout/BrandLogo";
import "./TapInManager.css";

type Status = "draft" | "live" | "closed" | "archived";

type Opportunity = {
  id: string;
  slug: string;
  title: string;
  country: string;
  region: string;
  sector: string;
  opportunity_type: string;
  description: string;
  who_this_is_for: string;
  enquiry_questions: string[];
  status: Status;
  image_url: string | null;
  share_image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at?: string;
  updated_at: string;
};

type Draft = {
  slug: string;
  title: string;
  opportunity_type: string;
  who_this_is_for: string;
  description: string;
  sector: string;
  country: string;
  region: string;
  image_url: string;
  share_image_url: string;
  enquiry_questions: string[];
  seo_title: string;
  seo_description: string;
  status: Status;
};

type Notice = { tone: "success" | "error"; text: string };
type Sort = "latest" | "oldest" | "title";

const PAGE_SIZE = 6;
const BLANK: Draft = {
  slug: "", title: "", opportunity_type: "", who_this_is_for: "", description: "", sector: "", country: "", region: "",
  image_url: "", share_image_url: "", enquiry_questions: ["", ""], seo_title: "", seo_description: "", status: "draft",
};
const TYPE_SUGGESTIONS = ["Investment", "Partnership", "Procurement", "Distribution", "Funding", "Joint venture", "Job", "Programme"];
const STATUS_LABEL: Record<Status, string> = { draft: "Draft", live: "Live", closed: "Closed", archived: "Archived" };

const NAV: { href: string; label: string; icon: string; active?: boolean }[] = [
  { href: "/admin", label: "Dashboard", icon: "grid" },
  { href: "/admin/tap-in", label: "TAP IN", icon: "briefcase", active: true },
  { href: "/admin/blog", label: "Blog & Editorial", icon: "edit" },
  { href: "/admin/store", label: "Store Products", icon: "store" },
  { href: "/admin/work-with-fk", label: "Work With FK", icon: "link" },
  { href: "/admin/enquiries", label: "Enquiries & Forms", icon: "mail" },
];

const ICONS: Record<string, string> = {
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  briefcase: "M3 8h18v12H3zM9 8V5h6v3M3 13h18",
  edit: "M4 20h4L19 9l-4-4L4 16zM13 7l4 4",
  store: "M4 9l1-5h14l1 5M4 9v11h16V9M4 9c0 2 4 2 4 0 0 2 4 2 4 0 0 2 4 2 4 0 0 2 4 2 4 0M10 20v-6h4v6",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  mail: "M3 5h18v14H3zM3 6l9 7 9-7",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-2-4-2 .5-1.5-1L15 4H9l-.5 2.5-1.5 1L5 7l-2 4 2 1v1l-2 1 2 4 2-.5 1.5 1L9 20h6l.5-2.5 1.5-1 2 .5 2-4-2-1z",
  eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5",
  filter: "M3 5h18l-7 8v6l-4-2v-4z",
  plus: "M12 5v14M5 12h14",
  pin: "M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  tag: "M3 12V4h8l10 10-8 8zM7.5 7.5h.01",
  back: "M19 12H5M11 6l-6 6 6 6",
  x: "M6 6l12 12M18 6L6 18",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4z",
  check: "M5 12l5 5 9-10",
  upload: "M12 16V4M7 9l5-5 5 5M4 20h16",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
  home: "M3 11l9-8 9 8M5 10v10h14V10",
  bulb: "M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 3z",
  more: "M5 12h.01M12 12h.01M19 12h.01",
};

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg className="tapin-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name] ?? ""} />
    </svg>
  );
}

function toDraft(item: Opportunity): Draft {
  return {
    slug: item.slug, title: item.title, opportunity_type: item.opportunity_type, who_this_is_for: item.who_this_is_for,
    description: item.description, sector: item.sector, country: item.country, region: item.region,
    image_url: item.image_url ?? "", share_image_url: item.share_image_url ?? "", enquiry_questions: [...item.enquiry_questions],
    seo_title: item.seo_title ?? "", seo_description: item.seo_description ?? "", status: item.status,
  };
}

function place(item: { country: string; region: string }) {
  return [item.region, item.country].map((part) => part.trim()).filter(Boolean).join(", ");
}

function Field({ label, required, hint, count, max, children, className }: { label: string; required?: boolean; hint?: string; count?: number; max?: number; children: ReactNode; className?: string }) {
  return (
    <label className={`tapin-field ${className ?? ""}`}>
      <span className="tapin-fieldLabel">{label}{required ? <b aria-hidden="true"> *</b> : null}{!required && hint ? <i> ({hint})</i> : null}</span>
      {children}
      {typeof count === "number" && max ? <span className="tapin-counter">{count}/{max}</span> : null}
    </label>
  );
}

export default function TapInManager() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [view, setView] = useState<"list" | "editor">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(BLANK);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"image_url" | "share_image_url" | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [sort, setSort] = useState<Sort>("latest");
  const [page, setPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/tap-in/opportunities", { cache: "no-store" });
      const data = await response.json() as { opportunities?: Opportunity[]; error?: string };
      if (!response.ok) {
        setNotice({ tone: "error", text: data.error || "Could not load the TAP IN listings." });
        return;
      }
      setItems(Array.isArray(data.opportunities) ? data.opportunities : []);
    } catch {
      setNotice({ tone: "error", text: "Could not connect to the TAP IN manager. Please try again." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch-on-mount: state is only set after the request returns.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadItems();
  }, [loadItems]);

  const counts = useMemo(() => ({
    total: items.length,
    live: items.filter((item) => item.status === "live").length,
    draft: items.filter((item) => item.status === "draft").length,
    closed: items.filter((item) => item.status === "closed" || item.status === "archived").length,
  }), [items]);

  const visible = useMemo(() => {
    const phrase = search.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesSearch = !phrase || [item.title, item.sector, item.country, item.region, item.opportunity_type].some((value) => value.toLowerCase().includes(phrase));
      return matchesStatus && matchesSearch;
    });
    return filtered.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      const diff = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      return sort === "latest" ? diff : -diff;
    });
  }, [items, search, statusFilter, sort]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function openEditor(item?: Opportunity) {
    setEditingId(item?.id ?? null);
    setDraft(item ? toDraft(item) : BLANK);
    setNotice(null);
    setView("editor");
    window.scrollTo({ top: 0 });
  }

  function closeEditor() {
    setView("list");
    setEditingId(null);
    setDraft(BLANK);
    window.scrollTo({ top: 0 });
  }

  function problem(): string | null {
    if (draft.title.trim().length < 2) return "Add a listing title.";
    if (draft.opportunity_type.trim().length < 2) return "Choose or type an opportunity type.";
    if (draft.who_this_is_for.trim().length < 5) return "Say who this opportunity is for.";
    if (draft.description.trim().length < 10) return "Add a fuller description of the opportunity.";
    if (draft.sector.trim().length < 2) return "Add a sector or category.";
    if (!draft.country.trim() && !draft.region.trim()) return "Add a country and/or region.";
    const questions = draft.enquiry_questions.map((question) => question.trim());
    if (questions.length < 2 || questions.some((question) => question.length < 3)) return "Add two to four enquiry questions, each at least 3 characters.";
    return null;
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const issue = problem();
    if (issue) { setNotice({ tone: "error", text: issue }); return; }
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch(editingId ? `/api/admin/tap-in/opportunities/${editingId}` : "/api/admin/tap-in/opportunities", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) { setNotice({ tone: "error", text: data.error || "Could not save this listing." }); return; }
      await loadItems();
      closeEditor();
      setNotice({ tone: "success", text: editingId ? "Listing updated." : draft.status === "live" ? "Listing created and published." : "Listing saved as a draft." });
    } catch {
      setNotice({ tone: "error", text: "Could not save this listing. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(item: Opportunity, status: Status) {
    const verb = { live: item.status === "closed" ? "reopen" : "publish", closed: "close", archived: "archive", draft: item.status === "archived" ? "restore" : "return to draft" }[status];
    if (!window.confirm(`Are you sure you want to ${verb} “${item.title}”?`)) return;
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/tap-in/opportunities/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...toDraft(item), status }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) { setNotice({ tone: "error", text: data.error || `Could not ${verb} this listing.` }); return; }
      setNotice({ tone: "success", text: `Done. “${item.title}” is now ${STATUS_LABEL[status].toLowerCase()}.` });
      await loadItems();
    } catch {
      setNotice({ tone: "error", text: `Could not ${verb} this listing.` });
    }
  }

  async function uploadImage(field: "image_url" | "share_image_url", file: File | undefined) {
    if (!file) return;
    setUploading(field);
    setNotice(null);
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body: form });
      const data = await response.json() as { error?: string; record?: { data?: { url?: string } } };
      const url = data.record?.data?.url;
      if (!response.ok || !url) { setNotice({ tone: "error", text: data.error || "Upload failed. You can paste an image link instead." }); return; }
      update(field, url);
    } catch {
      setNotice({ tone: "error", text: "Upload failed. You can paste an image link instead." });
    } finally {
      setUploading(null);
    }
  }

  async function signOut() {
    try { await fetch("/api/admin/session", { method: "DELETE" }); }
    // Full reload on purpose: it resets the admin session gate.
    finally { window.location.href = "/admin"; } // eslint-disable-line @next/next/no-location-assign-relative-destination
  }

  const questionCount = draft.enquiry_questions.length;
  const toggleable = draft.status === "draft" || draft.status === "live";

  return (
    <div className="tapin-page">
      <header className="tapin-topbar">
        <Link className="tapin-brand" href="/" aria-label="The Africa Plug homepage">
          <BrandLogo height={60} />
        </Link>
        <div className="tapin-topActions">
          <Link className="tapin-viewLink" href="/tap-in" target="_blank" rel="noreferrer"><Icon name="eye" size={16} /> <span>View TAP IN Page</span> <span aria-hidden="true">↗</span></Link>
          <div className="tapin-profile">
            <button type="button" className="tapin-profileButton" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
              <span className="tapin-avatar">A</span><span className="tapin-profileName">Admin</span><span aria-hidden="true">⌄</span>
            </button>
            {menuOpen ? <div className="tapin-menu"><button type="button" onClick={() => void signOut()}>Sign out →</button></div> : null}
          </div>
        </div>
      </header>

      <div className="tapin-layout">
        <aside className="tapin-sidebar" aria-label="Admin navigation">
          <Link className="tapin-homePill" href="/admin"><Icon name="back" size={15} /> Admin Home</Link>
          <p className="tapin-navLabel">MAIN</p>
          {NAV.map((entry) => (
            <Link key={entry.href} href={entry.href} className={`tapin-navItem ${entry.active ? "tapin-navActive" : ""}`} aria-current={entry.active ? "page" : undefined}>
              <Icon name={entry.icon} /> {entry.label}
            </Link>
          ))}
          <p className="tapin-navLabel">SETTINGS</p>
          <Link href="/admin/site-settings" className="tapin-navItem"><Icon name="gear" /> Site Settings</Link>
          <p className="tapin-sideScript" aria-hidden="true">More Opportunities.<br />Bigger Dreams.</p>
        </aside>

        <main className="tapin-main">
          {view === "list" ? (
            <>
              <section className="tapin-heading">
                <div>
                  <span className="tapin-chip">TAP IN</span>
                  <h1>Manage Opportunities</h1>
                  <p>Create, edit and manage TAP IN listings. These opportunities help connect talented Africans with global opportunities.</p>
                </div>
                <p className="tapin-script" aria-hidden="true">Real Opportunities.<br />Real Impact.</p>
              </section>

              {notice ? <p className={`tapin-notice tapin-${notice.tone}`} role="status">{notice.text}</p> : null}

              <section className="tapin-stats" aria-label="Listing summary">
                <div className="tapin-stat"><div><span>Total Listings</span><strong>{counts.total}</strong><small className="tapin-pinkText">All opportunities</small></div><span className="tapin-statIcon tapin-tonePink"><Icon name="briefcase" /></span></div>
                <div className="tapin-stat"><div><span>Live</span><strong>{counts.live}</strong><small><i className="tapin-dot tapin-dotGreen" />Active &amp; visible</small></div><span className="tapin-statIcon tapin-toneGreen"><Icon name="check" /></span></div>
                <div className="tapin-stat"><div><span>Drafts</span><strong>{counts.draft}</strong><small><i className="tapin-dot tapin-dotAmber" />Not yet published</small></div><span className="tapin-statIcon tapin-toneAmber"><Icon name="edit" /></span></div>
                <div className="tapin-stat"><div><span>Closed</span><strong>{counts.closed}</strong><small><i className="tapin-dot tapin-dotGrey" />No longer accepting</small></div><span className="tapin-statIcon tapin-toneGrey"><Icon name="x" /></span></div>
              </section>

              <section className="tapin-toolbar">
                <label className="tapin-search"><Icon name="search" size={17} /><span className="tapin-srOnly">Search listings</span>
                  <input type="search" placeholder="Search by title, category or location…" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
                </label>
                <label className="tapin-select"><Icon name="filter" size={16} /><span className="tapin-srOnly">Filter by status</span>
                  <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as Status | "all"); setPage(1); }}>
                    <option value="all">All Statuses</option><option value="live">Live</option><option value="draft">Draft</option><option value="closed">Closed</option><option value="archived">Archived</option>
                  </select>
                </label>
                <button type="button" className="tapin-primary" onClick={() => openEditor()}><Icon name="plus" size={16} /> Create New Listing</button>
              </section>

              <div className="tapin-listHead">
                <h2>All Listings ({visible.length})</h2>
                <label className="tapin-sort"><span className="tapin-srOnly">Sort listings</span>
                  <select value={sort} onChange={(event) => setSort(event.target.value as Sort)}>
                    <option value="latest">Latest First</option><option value="oldest">Oldest First</option><option value="title">Title A–Z</option>
                  </select>
                </label>
              </div>

              {loading ? <p className="tapin-empty">Loading listings…</p> : null}
              {!loading && !visible.length ? (
                <div className="tapin-empty">
                  <strong>{items.length ? "No listings match your search." : "No TAP IN listings yet."}</strong>
                  <p>{items.length ? "Try a different search or status." : "Create your first listing to publish an opportunity on TAP IN."}</p>
                </div>
              ) : null}

              <ul className="tapin-list">
                {pageItems.map((item) => (
                  <li key={item.id} className="tapin-row">
                    <div className="tapin-thumb">
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image_url} alt="" loading="lazy" />
                      ) : <span aria-hidden="true">{item.title.slice(0, 1).toUpperCase()}</span>}
                    </div>
                    <div className="tapin-rowBody">
                      <div className="tapin-rowTop">
                        <h3>{item.title}</h3>
                        <span className={`tapin-pill tapin-pill_${item.status}`}><i />{STATUS_LABEL[item.status]}</span>
                      </div>
                      <p className="tapin-rowText">{item.who_this_is_for}</p>
                      <div className="tapin-rowMeta">
                        {place(item) ? <span><Icon name="pin" size={14} /> {place(item)}</span> : null}
                        <span><Icon name="tag" size={14} /> {item.opportunity_type}</span>
                        {item.sector ? <span>{item.sector}</span> : null}
                      </div>
                      <div className="tapin-actions">
                        <button type="button" className="tapin-soft" onClick={() => openEditor(item)}><Icon name="edit" size={14} /> Edit</button>
                        {item.status === "live" || item.status === "closed" ? (
                          <Link className="tapin-soft" href={`/tap-in/${item.slug}`} target="_blank" rel="noreferrer"><Icon name="eye" size={14} /> View</Link>
                        ) : null}
                        {item.status === "draft" ? <button type="button" className="tapin-solid" onClick={() => void changeStatus(item, "live")}><Icon name="send" size={14} /> Publish</button> : null}
                        {item.status === "live" ? <button type="button" className="tapin-solid" onClick={() => void changeStatus(item, "closed")}><Icon name="x" size={14} /> Close</button> : null}
                        {item.status === "closed" ? <button type="button" className="tapin-solid" onClick={() => void changeStatus(item, "live")}><Icon name="send" size={14} /> Reopen</button> : null}
                        {item.status === "closed" ? <button type="button" className="tapin-ghost" onClick={() => void changeStatus(item, "archived")}>Archive</button> : null}
                        {item.status === "archived" ? <button type="button" className="tapin-ghost" onClick={() => void changeStatus(item, "draft")}>Restore</button> : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {visible.length > PAGE_SIZE ? (
                <nav className="tapin-pager" aria-label="Listing pages">
                  <span>Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, visible.length)} of {visible.length} listings</span>
                  <div>
                    <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous page">‹</button>
                    {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                      <button key={number} type="button" className={number === currentPage ? "tapin-pageActive" : ""} aria-current={number === currentPage ? "page" : undefined} onClick={() => setPage(number)}>{number}</button>
                    ))}
                    <button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} aria-label="Next page">›</button>
                  </div>
                </nav>
              ) : null}
            </>
          ) : (
            <form onSubmit={save} noValidate>
              <section className="tapin-heading">
                <div>
                  <span className="tapin-chip">TAP IN</span>
                  <h1>{editingId ? "Edit Listing" : "Create New Listing"}</h1>
                  <p>Share opportunities with African talent. Fill in the details below to {editingId ? "update this" : "create a"} TAP IN listing.</p>
                </div>
                <p className="tapin-script" aria-hidden="true">Real Opportunities.<br />Real Impact.</p>
              </section>

              {notice ? <p className={`tapin-notice tapin-${notice.tone}`} role="alert">{notice.text}</p> : null}

              <div className="tapin-editorGrid">
                <div className="tapin-cards">
                  <section className="tapin-card">
                    <h2><span className="tapin-step">1</span><span>Basic Information<small>Start with the key details about your opportunity.</small></span></h2>
                    <div className="tapin-twoCol">
                      <Field label="Listing Title" required><input value={draft.title} maxLength={180} placeholder="e.g. Cold-chain distribution partner, Lagos" onChange={(event) => update("title", event.target.value)} /></Field>
                      <Field label="Opportunity Type" required>
                        <input list="tap-in-types" value={draft.opportunity_type} maxLength={120} placeholder="Select or type a type" onChange={(event) => update("opportunity_type", event.target.value)} />
                        <datalist id="tap-in-types">{[...new Set([...TYPE_SUGGESTIONS, ...items.map((item) => item.opportunity_type)])].map((type) => <option key={type} value={type} />)}</datalist>
                      </Field>
                    </div>
                    <Field label="Who this is for" required count={draft.who_this_is_for.length} max={3000}>
                      <textarea rows={3} value={draft.who_this_is_for} maxLength={3000} placeholder="A short summary of who this opportunity suits. It appears in listings." onChange={(event) => update("who_this_is_for", event.target.value)} />
                    </Field>
                    <Field label="Full Description" required count={draft.description.length} max={12000}>
                      <textarea rows={8} value={draft.description} maxLength={12000} placeholder="Describe the opportunity: the commercial context, what is needed, and how enquiries are handled." onChange={(event) => update("description", event.target.value)} />
                    </Field>
                  </section>

                  <section className="tapin-card">
                    <h2><span className="tapin-step">2</span><span>Details &amp; Settings<small>Add more information to help the right people find this.</small></span></h2>
                    <div className="tapin-twoCol">
                      <Field label="Sector / Category" required><input value={draft.sector} maxLength={120} placeholder="e.g. Agriculture, Energy, Fintech" onChange={(event) => update("sector", event.target.value)} /></Field>
                      <Field label="Country" hint="or region below"><input value={draft.country} maxLength={120} placeholder="e.g. Nigeria" onChange={(event) => update("country", event.target.value)} /></Field>
                      <Field label="Region" hint="optional"><input value={draft.region} maxLength={120} placeholder="e.g. West Africa" onChange={(event) => update("region", event.target.value)} /></Field>
                    </div>
                  </section>

                  <section className="tapin-card">
                    <h2><span className="tapin-step">3</span><span>Images &amp; Sharing<small>Optional. Add a listing image and a social share image.</small></span></h2>
                    <div className="tapin-twoCol">
                      {(["image_url", "share_image_url"] as const).map((field) => (
                        <Field key={field} label={field === "image_url" ? "Listing image" : "Share image"} hint="optional">
                          <input type="url" value={draft[field]} placeholder="https://…" onChange={(event) => update(field, event.target.value)} />
                          <span className="tapin-uploadRow">
                            <span className="tapin-uploadBtn"><Icon name="upload" size={15} /> {uploading === field ? "Uploading…" : "Upload image"}
                              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading !== null} onChange={(event) => { void uploadImage(field, event.target.files?.[0]); event.target.value = ""; }} />
                            </span>
                            {draft[field] ? <button type="button" className="tapin-linkBtn" onClick={() => update(field, "")}>Remove</button> : null}
                          </span>
                        </Field>
                      ))}
                    </div>
                  </section>

                  <section className="tapin-card">
                    <h2><span className="tapin-step">4</span><span>Enquiry Questions<small>Add two to four questions people answer when they show interest.</small></span></h2>
                    <div className="tapin-questions">
                      {draft.enquiry_questions.map((question, index) => (
                        <div className="tapin-questionRow" key={index}>
                          <Field label={`Question ${index + 1}`} required className="tapin-grow">
                            <input value={question} maxLength={500} placeholder="e.g. What is your estimated annual volume?" onChange={(event) => setDraft((current) => ({ ...current, enquiry_questions: current.enquiry_questions.map((value, i) => i === index ? event.target.value : value) }))} />
                          </Field>
                          {questionCount > 2 ? <button type="button" className="tapin-iconBtn" aria-label={`Remove question ${index + 1}`} onClick={() => update("enquiry_questions", draft.enquiry_questions.filter((_, i) => i !== index))}><Icon name="trash" size={16} /></button> : null}
                        </div>
                      ))}
                    </div>
                    {questionCount < 4 ? <button type="button" className="tapin-addBtn" onClick={() => update("enquiry_questions", [...draft.enquiry_questions, ""])}><Icon name="plus" size={15} /> Add Question</button> : null}
                  </section>

                  <section className="tapin-card">
                    <h2><span className="tapin-step">5</span><span>SEO &amp; Visibility <i>(optional)</i><small>Help your listing get discovered on search engines.</small></span></h2>
                    <div className="tapin-twoCol">
                      <Field label="SEO Title" count={draft.seo_title.length} max={180}><input value={draft.seo_title} maxLength={180} placeholder="Shown in search results" onChange={(event) => update("seo_title", event.target.value)} /></Field>
                      <Field label="Meta Description" count={draft.seo_description.length} max={320}><textarea rows={3} value={draft.seo_description} maxLength={320} placeholder="Brief description for search engines" onChange={(event) => update("seo_description", event.target.value)} /></Field>
                    </div>
                    {toggleable ? (
                      <label className="tapin-switchRow">
                        <input type="checkbox" role="switch" checked={draft.status === "live"} onChange={(event) => update("status", event.target.checked ? "live" : "draft")} />
                        <span className="tapin-switch" aria-hidden="true" />
                        <span><b>Publish immediately</b><small>Leave off to save as a draft and publish later.</small></span>
                      </label>
                    ) : (
                      <Field label="Status"><select value={draft.status} onChange={(event) => update("status", event.target.value as Status)}>
                        <option value="draft">Draft</option><option value="live">Live</option><option value="closed">Closed</option><option value="archived">Archived</option>
                      </select></Field>
                    )}
                    <div className="tapin-formFoot">
                      <button type="button" className="tapin-cancel" onClick={closeEditor}>Cancel</button>
                      <button type="submit" className="tapin-primary" disabled={saving || uploading !== null}>{saving ? "Saving…" : "Save Listing"}</button>
                    </div>
                  </section>
                </div>

                <aside className="tapin-side">
                  <section className="tapin-card">
                    <h2 className="tapin-previewTitle"><Icon name="eye" size={17} /> Listing Preview</h2>
                    <p className="tapin-muted">This is how your listing will appear on the TAP IN page.</p>
                    <div className="tapin-preview">
                      <div className="tapin-previewImage">
                        {draft.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={draft.image_url} alt="" />
                        ) : <span>{(draft.title.trim()[0] || "T").toUpperCase()}</span>}
                      </div>
                      <span className={`tapin-pill tapin-pill_${draft.status}`}><i />{STATUS_LABEL[draft.status]}</span>
                      <h3>{draft.title.trim() || "Example Listing Title"}</h3>
                      <p className="tapin-previewMeta"><Icon name="pin" size={14} /> {place(draft) || "Country, Region"}</p>
                      {draft.opportunity_type.trim() ? <span className="tapin-typeChip">{draft.opportunity_type.trim()}</span> : null}
                      <p className="tapin-previewText">{draft.who_this_is_for.trim() || "A short summary of who this opportunity is for will appear here."}</p>
                      <span className="tapin-previewLink">View Details →</span>
                    </div>
                  </section>
                  <section className="tapin-card tapin-tips">
                    <h2 className="tapin-previewTitle"><Icon name="bulb" size={17} /> Tips</h2>
                    <ul>
                      <li>Use a clear and specific title</li>
                      <li>Say plainly who the opportunity is for</li>
                      <li>Choose the right sector and location</li>
                      <li>Ask questions that help you qualify interest</li>
                      <li>Add an image so the listing stands out</li>
                    </ul>
                  </section>
                </aside>
              </div>
            </form>
          )}
        </main>
      </div>

      <nav className="tapin-tabbar" aria-label="Admin quick navigation">
        <Link href="/admin"><Icon name="home" size={20} /><span>Home</span></Link>
        <Link href="/admin/tap-in" className="tapin-tabActive"><Icon name="send" size={20} /><span>TAP IN</span></Link>
        <Link href="/admin/blog"><Icon name="edit" size={20} /><span>Blog</span></Link>
        <Link href="/admin/store"><Icon name="store" size={20} /><span>Store</span></Link>
        <Link href="/admin"><Icon name="more" size={20} /><span>More</span></Link>
      </nav>
    </div>
  );
}