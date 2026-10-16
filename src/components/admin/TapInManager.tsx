"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import styles from "./TapInManager.module.css";

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
  updated_at: string;
};

type Draft = {
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
  image_url: string;
  share_image_url: string;
  seo_title: string;
  seo_description: string;
};

const BLANK: Draft = {
  slug: "",
  title: "",
  country: "",
  region: "",
  sector: "",
  opportunity_type: "",
  description: "",
  who_this_is_for: "",
  enquiry_questions: ["", ""],
  status: "draft",
  image_url: "",
  share_image_url: "",
  seo_title: "",
  seo_description: "",
};

const STATUS_LABEL: Record<Status, string> = {
  draft: "Draft",
  live: "Live",
  closed: "Closed",
  archived: "Archived",
};

function toDraft(item: Opportunity): Draft {
  return {
    slug: item.slug,
    title: item.title,
    country: item.country,
    region: item.region,
    sector: item.sector,
    opportunity_type: item.opportunity_type,
    description: item.description,
    who_this_is_for: item.who_this_is_for,
    enquiry_questions: [...item.enquiry_questions],
    status: item.status,
    image_url: item.image_url ?? "",
    share_image_url: item.share_image_url ?? "",
    seo_title: item.seo_title ?? "",
    seo_description: item.seo_description ?? "",
  };
}

export default function TapInManager() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [items, setItems] = useState<Opportunity[]>([]);
  const [draft, setDraft] = useState<Draft>(BLANK);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/tap-in/opportunities", { cache: "no-store" });
      const data = await response.json() as { opportunities?: Opportunity[]; error?: string };
      if (!response.ok) {
        setNotice({ tone: "error", text: data.error || "Could not load the TAP IN listings." });
        return;
      }
      setItems(Array.isArray(data.opportunities) ? data.opportunities : []);
      setNotice(null);
    } catch {
      setNotice({ tone: "error", text: "Could not connect to the TAP IN manager. Please try again." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function checkSession() {
      try {
        const response = await fetch("/api/admin/session", { cache: "no-store" });
        const data = await response.json() as { authenticated?: boolean };
        if (!active) return;
        const valid = response.ok && data.authenticated === true;
        setAuthenticated(valid);
        if (valid) void loadItems();
      } catch {
        if (active) setNotice({ tone: "error", text: "Could not check the admin session." });
      } finally {
        if (active) setChecking(false);
      }
    }
    void checkSession();
    return () => { active = false; };
  }, [loadItems]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) {
        setNotice({ tone: "error", text: data.error || "Sign-in failed." });
        return;
      }
      setPassword("");
      setAuthenticated(true);
      await loadItems();
    } catch {
      setNotice({ tone: "error", text: "Could not connect to admin sign-in." });
    } finally {
      setLoginBusy(false);
    }
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => undefined);
    setAuthenticated(false);
    setItems([]);
    setNotice({ tone: "success", text: "You have signed out." });
  }

  function updateDraft<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function changeQuestion(index: number, value: string) {
    setDraft((current) => ({
      ...current,
      enquiry_questions: current.enquiry_questions.map((question, i) => i === index ? value : question),
    }));
  }

  function addQuestion() {
    if (draft.enquiry_questions.length < 4) updateDraft("enquiry_questions", [...draft.enquiry_questions, ""]);
  }

  function removeQuestion(index: number) {
    if (draft.enquiry_questions.length <= 2) return;
    updateDraft("enquiry_questions", draft.enquiry_questions.filter((_, i) => i !== index));
  }

  function startNew() {
    setEditingId(null);
    setDraft(BLANK);
    setNotice(null);
  }

  function startEdit(item: Opportunity) {
    setEditingId(item.id);
    setDraft(toDraft(item));
    setNotice(null);
    document.getElementById("tap-in-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    const endpoint = editingId ? `/api/admin/tap-in/opportunities/${editingId}` : "/api/admin/tap-in/opportunities";
    const method = editingId ? "PATCH" : "POST";
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await response.json() as { opportunity?: Opportunity; error?: string };
      if (!response.ok) {
        setNotice({ tone: "error", text: data.error || "Could not save this opportunity." });
        return;
      }
      setNotice({
        tone: "success",
        text: editingId ? "Opportunity updated." : "Opportunity created.",
      });
      setEditingId(null);
      setDraft(BLANK);
      await loadItems();
    } catch {
      setNotice({ tone: "error", text: "Could not save this opportunity. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(item: Opportunity, status: Status) {
    const actionLabel = status === "live" ? "publish" : status === "closed" ? "close" : status === "archived" ? "archive" : "return to draft";
    if (!window.confirm(`Are you sure you want to ${actionLabel} “${item.title}”?`)) return;
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/tap-in/opportunities/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...toDraft(item), status }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) {
        setNotice({ tone: "error", text: data.error || `Could not ${actionLabel} the listing.` });
        return;
      }
      const completed = status === "live" ? "published" : status === "closed" ? "closed" : status === "archived" ? "archived" : "returned to draft";\n      setNotice({ tone: "success", text: `Listing ${completed}.` });
      await loadItems();
    } catch {
      setNotice({ tone: "error", text: `Could not ${actionLabel} the listing.` });
    }
  }

  const filteredItems = items.filter((item) => {
    const phrase = search.trim().toLowerCase();
    const matchesSearch = !phrase || [item.title, item.country, item.region, item.sector, item.opportunity_type, item.slug]
      .some((value) => value.toLowerCase().includes(phrase));
    return matchesSearch && (statusFilter === "all" || item.status === statusFilter);
  });

  if (checking) {
    return <main className={styles.page}><p className={styles.muted}>Checking admin session…</p></main>;
  }

  if (!authenticated) {
    return (
      <main className={styles.page}>
        <div className={styles.header}>
          <a className={styles.brand} href="/">THE AFRICA PLUG</a>
          <a className={styles.back} href="/">Back to website ↗</a>
        </div>
        <section className={styles.login}>
          <p className={styles.kicker}>TAP IN MANAGEMENT</p>
          <h1>Sign in to manage opportunities.</h1>
          <p>Use the website admin password to create, edit, publish, close or archive listings.</p>
          {notice ? <p className={`${styles.notice} ${styles[notice.tone]}`} role="status">{notice.text}</p> : null}
          <form onSubmit={signIn} className={styles.form}>
            <label htmlFor="tap-in-admin-password">Admin password</label>
            <input id="tap-in-admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button className={styles.primary} type="submit" disabled={loginBusy}>{loginBusy ? "Signing in…" : "Sign in"}</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="/">THE AFRICA PLUG <span>/ TAP IN</span></a>
        <div className={styles.headerActions}>
          <a className={styles.back} href="/tap-in" target="_blank" rel="noreferrer">View public page ↗</a>
          <button className={styles.secondary} type="button" onClick={signOut}>Sign out</button>
        </div>
      </header>

      <section className={styles.intro}>
        <p className={styles.kicker}>OPPORTUNITY CONTROL</p>
        <h1>Manage TAP IN.</h1>
        <p>Create and manage opportunity records. Only listings marked Live appear on the public TAP IN page. Draft / Live / Closed / Archived statuses are internal and never shown as public status labels.</p>
        <div className={styles.summary}>
          <div><strong>{items.length}</strong><span>Total listings</span></div>
          <div><strong>{items.filter((item) => item.status === "live").length}</strong><span>Live</span></div>
          <div><strong>{items.filter((item) => item.status === "draft").length}</strong><span>Drafts</span></div>
          <div><strong>{items.filter((item) => item.status === "closed").length}</strong><span>Closed</span></div>
        </div>
      </section>

      {notice ? <p className={`${styles.notice} ${styles[notice.tone]}`} role="status">{notice.text}</p> : null}

      <section className={styles.panel} aria-labelledby="tap-in-listings-heading">
        <div className={styles.panelHeading}>
          <div><h2 id="tap-in-listings-heading">Opportunity listings</h2><p>Manage all statuses. Public posting dates are not displayed.</p></div>
          <button className={styles.primary} type="button" onClick={startNew}>+ Add listing</button>
        </div>
        <div className={styles.filters}>
          <label className={styles.searchLabel}>Search listings<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Title, location, sector…" /></label>
          <label>Status filter<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as Status | "all")}><option value="all">All statuses</option><option value="draft">Draft</option><option value="live">Live</option><option value="closed">Closed</option><option value="archived">Archived</option></select></label>
          <button className={styles.secondary} type="button" onClick={() => void loadItems()} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</button>
        </div>
        {filteredItems.length ? (
          <div className={styles.list}>
            {filteredItems.map((item) => (
              <article className={styles.listItem} key={item.id}>
                <div className={styles.itemCopy}>
                  <span className={`${styles.badge} ${styles[`status_${item.status}`]}`}>{STATUS_LABEL[item.status]}</span>
                  <h3>{item.title}</h3>
                  <p>{[item.country, item.region, item.sector, item.opportunity_type].filter(Boolean).join(" · ")}</p>
                  <small>URL: /tap-in/{item.slug}</small>
                </div>
                <div className={styles.itemActions}>
                  <button type="button" className={styles.secondary} onClick={() => startEdit(item)}>Edit</button>
                  {item.status !== "live" ? <button type="button" className={styles.secondary} onClick={() => void changeStatus(item, "live")}>Publish</button> : null}
                  {item.status === "live" ? <button type="button" className={styles.secondary} onClick={() => void changeStatus(item, "closed")}>Close</button> : null}
                  {item.status !== "archived" ? <button type="button" className={styles.secondary} onClick={() => void changeStatus(item, "archived")}>Archive</button> : null}
                  {item.status === "archived" ? <button type="button" className={styles.secondary} onClick={() => void changeStatus(item, "draft")}>Restore to draft</button> : null}
                </div>
              </article>
            ))}
          </div>
        ) : <div className={styles.empty}>{loading ? "Loading opportunity records…" : items.length ? "No listings match these filters." : "No opportunity records yet. Add a real, verified opportunity when one is ready to publish."}</div>}
      </section>

      <section className={styles.panel} id="tap-in-editor" aria-labelledby="tap-in-editor-heading">
        <div className={styles.panelHeading}>
          <div><h2 id="tap-in-editor-heading">{editingId ? "Edit opportunity" : "Add an opportunity"}</h2><p>Only enter confirmed information that is approved to be shared publicly.</p></div>
          {editingId ? <button className={styles.secondary} type="button" onClick={startNew}>Cancel edit</button> : null}
        </div>
        <form className={styles.form} onSubmit={save}>
          <div className={styles.formGrid}>
            <label>Title<input required minLength={2} maxLength={180} value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} /></label>
            <label>URL slug {editingId ? <small>(locked to preserve the shared URL)</small> : null}<input required value={draft.slug} readOnly={Boolean(editingId)} onChange={(event) => updateDraft("slug", event.target.value)} placeholder="Generated from title when blank" /></label>
            <label>Country<input maxLength={120} value={draft.country} onChange={(event) => updateDraft("country", event.target.value)} /></label>
            <label>Region<input maxLength={120} value={draft.region} onChange={(event) => updateDraft("region", event.target.value)} /></label>
            <label>Sector<input required minLength={2} maxLength={120} value={draft.sector} onChange={(event) => updateDraft("sector", event.target.value)} /></label>
            <label>Opportunity type<input required minLength={2} maxLength={120} value={draft.opportunity_type} onChange={(event) => updateDraft("opportunity_type", event.target.value)} /></label>
          </div>
          <label>Description<textarea required minLength={10} maxLength={12000} rows={6} value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} /></label>
          <label>Who this is for<textarea required minLength={5} maxLength={3000} rows={3} value={draft.who_this_is_for} onChange={(event) => updateDraft("who_this_is_for", event.target.value)} /><small>Describe relevant participants without naming the principal unless specifically approved.</small></label>
          <fieldset className={styles.questions}>
            <legend>Custom enquiry questions (2–4)</legend>
            {draft.enquiry_questions.map((question, index) => (
              <div className={styles.questionRow} key={index}>
                <label>Question {index + 1}<input required minLength={3} maxLength={500} value={question} onChange={(event) => changeQuestion(index, event.target.value)} /></label>
                {draft.enquiry_questions.length > 2 ? <button type="button" className={styles.remove} onClick={() => removeQuestion(index)} aria-label={`Remove question ${index + 1}`}>Remove</button> : null}
              </div>
            ))}
            {draft.enquiry_questions.length < 4 ? <button type="button" className={styles.secondary} onClick={addQuestion}>+ Add question</button> : null}
          </fieldset>
          <details className={styles.optional}>
            <summary>Images and SEO (optional)</summary>
            <div className={styles.formGrid}>
              <label>Opportunity image URL<input type="url" value={draft.image_url} onChange={(event) => updateDraft("image_url", event.target.value)} placeholder="https://…" /></label>
              <label>Share image URL<input type="url" value={draft.share_image_url} onChange={(event) => updateDraft("share_image_url", event.target.value)} placeholder="https://…" /></label>
              <label>SEO title<input maxLength={180} value={draft.seo_title} onChange={(event) => updateDraft("seo_title", event.target.value)} /></label>
              <label>SEO description<textarea rows={2} maxLength={320} value={draft.seo_description} onChange={(event) => updateDraft("seo_description", event.target.value)} /></label>
            </div>
          </details>
          <div className={styles.formFooter}>
            <label>Status<select value={draft.status} onChange={(event) => updateDraft("status", event.target.value as Status)}><option value="draft">Draft</option><option value="live">Live</option><option value="closed">Closed</option><option value="archived">Archived</option></select><small>Status is internal and is not displayed publicly.</small></label>
            <button className={styles.primary} type="submit" disabled={saving}>{saving ? "Saving…" : editingId ? "Save changes" : "Create listing"}</button>
          </div>
          <p className={styles.privacyNote}>Do not add public posting dates or disclose the opportunity principal. Closing a listing keeps its URL available, removes public expressions of interest when that form is enabled, and directs visitors towards current opportunities.</p>
        </form>
      </section>
    </main>
  );
}
