// FILE PATH: src/components/admin/TapInManager.tsx
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import styles from "./TapInManager.v2.module.css";

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
      setNotice((current) => current?.tone === "error" ? null : current);
    } catch {
      setNotice({ tone: "error", text: "Could not connect to the TAP IN manager. Please try again." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

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
        text: editingId ? "✨ Opportunity updated successfully." : "🚀 New opportunity created successfully.",
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
      const completed = status === "live" ? "published" : status === "closed" ? "closed" : status === "archived" ? "archived" : "returned to draft";
      setNotice({ tone: "success", text: `Listing successfully ${completed}.` });
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

  return (
    <main className={`${styles.page} tap-in-admin`}>
      <header className={`${styles.header} tap-in-admin-header`}>
        <div className={styles.brandWrapper}>
          <Link className={styles.brand} href="/">THE AFRICA PLUG</Link>
          <span className={styles.brandSub}>/ TAP IN MANAGER</span>
        </div>
        <div className={styles.headerActions}>
<<<<<<< HEAD
          <a className={styles.back} href="/admin" aria-label="Back to the main admin home">← Admin home</a>
          <a className={styles.back} href="/tap-in" target="_blank" rel="noreferrer">View public page ↗</a>
=======
          <Link className={styles.backButton} href="/tap-in" target="_blank" rel="noreferrer">
            View public page <span>↗</span>
          </Link>
>>>>>>> b79d4d0 (new update)
        </div>
      </header>

      <section className={`${styles.intro} tap-in-admin-intro`}>
        <div className={styles.introContent}>
          <span className={styles.kicker}>ADMIN CONTROL ROOM</span>
          <h1>Manage TAP IN Opportunities.</h1>
          <p>Create, edit, and control opportunity records. Only listings marked as <strong>Live</strong> appear on the public TAP IN directory.</p>
        </div>
        <div className={`${styles.summary} tap-in-admin-summary`}>
          <div className={styles.summaryCard}><strong>{items.length}</strong><span>Total Listings</span></div>
          <div className={`${styles.summaryCard} ${styles.sumLive}`}><strong>{items.filter((item) => item.status === "live").length}</strong><span>Live</span></div>
          <div className={styles.summaryCard}><strong>{items.filter((item) => item.status === "draft").length}</strong><span>Drafts</span></div>
          <div className={styles.summaryCard}><strong>{items.filter((item) => item.status === "closed").length}</strong><span>Closed</span></div>
        </div>
      </section>

      {notice ? (
        <div className={`${styles.notice} ${styles[notice.tone]}`} role="status">
          <span>{notice.tone === "success" ? "✓" : "⚠"}</span> {notice.text}
        </div>
      ) : null}

      <section className={`${styles.panel} tap-in-admin-panel`} aria-labelledby="tap-in-listings-heading">
        <div className={`${styles.panelHeading} tap-in-admin-panel-heading`}>
          <div>
            <h2 id="tap-in-listings-heading">Opportunity Directory</h2>
            <p>Filter, search, and manage statuses across all listings.</p>
          </div>
          <button className={styles.primaryBtn} type="button" onClick={startNew}>
            + Add New Opportunity
          </button>
        </div>

        <div className={`${styles.filters} tap-in-admin-filters`}>
          <div className={styles.searchBox}>
            <label className={styles.srOnly}>Search listings</label>
            <input 
              value={search} 
              onChange={(event) => setSearch(event.target.value)} 
              placeholder="🔍 Search by title, country, sector..." 
            />
          </div>
          <div className={styles.filterGroup}>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as Status | "all")}>
              <option value="all">All Statuses</option>
              <option value="draft">Drafts</option>
              <option value="live">Live</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
            <button className={styles.secondaryBtn} type="button" onClick={() => void loadItems()} disabled={loading}>
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        {filteredItems.length ? (
          <div className={`${styles.list} tap-in-admin-list`}>
            {filteredItems.map((item) => (
              <article className={`${styles.listItem} tap-in-admin-list-item`} key={item.id}>
                <div className={`${styles.itemCopy} tap-in-admin-item-copy`}>
                  <div className={styles.itemMetaRow}>
                    <span className={`${styles.badge} ${styles[`status_${item.status}`]}`}>
                      {STATUS_LABEL[item.status]}
                    </span>
                    <span className={styles.itemSector}>{item.sector}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{[item.country, item.region, item.opportunity_type].filter(Boolean).join(" · ")}</p>
                  <small className={styles.itemSlug}>Slug: /tap-in/{item.slug}</small>
                </div>
                <div className={`${styles.itemActions} tap-in-admin-item-actions`}>
                  <button type="button" className={styles.actionEdit} onClick={() => startEdit(item)}>Edit</button>
                  {item.status !== "live" ? <button type="button" className={styles.actionPublish} onClick={() => void changeStatus(item, "live")}>Publish</button> : null}
                  {item.status === "live" ? <button type="button" className={styles.actionClose} onClick={() => void changeStatus(item, "closed")}>Close</button> : null}
                  {item.status !== "archived" ? <button type="button" className={styles.actionArchive} onClick={() => void changeStatus(item, "archived")}>Archive</button> : null}
                  {item.status === "archived" ? <button type="button" className={styles.actionRestore} onClick={() => void changeStatus(item, "draft")}>Restore</button> : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={`${styles.empty} tap-in-admin-empty`}>
            <p>{loading ? "Loading opportunity records..." : items.length ? "No listings match your search criteria." : "No opportunities created yet. Add your first verified listing above!"}</p>
          </div>
        )}
      </section>

      <section className={`${styles.panel} tap-in-admin-panel`} id="tap-in-editor" aria-labelledby="tap-in-editor-heading">
        <div className={`${styles.panelHeading} tap-in-editor-heading`}>
          <div>
            <h2 id="tap-in-editor-heading">{editingId ? "✏️ Edit Opportunity" : "✨ Create New Opportunity"}</h2>
            <p>Ensure all information is verified and authorized for public release.</p>
          </div>
          {editingId ? <button className={styles.secondaryBtn} type="button" onClick={startNew}>Cancel Edit</button> : null}
        </div>

        <form className={`${styles.form} tap-in-admin-form`} onSubmit={save}>
          <div className={`${styles.formGrid} tap-in-admin-form-grid`}>
            <label>
              <span>Opportunity Title *</span>
              <input required minLength={2} maxLength={180} value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} placeholder="e.g. Pan-African Fintech Growth Grant" />
            </label>
            <label>
              <span>URL Slug {editingId ? <small className={styles.lockedNote}>(Locked)</small> : null}</span>
              <input value={draft.slug} readOnly={Boolean(editingId)} onChange={(event) => updateDraft("slug", event.target.value)} placeholder="auto-generated-from-title" />
            </label>
            <label>
              <span>Country</span>
              <input maxLength={120} value={draft.country} onChange={(event) => updateDraft("country", event.target.value)} placeholder="e.g. Nigeria / Kenya" />
            </label>
            <label>
              <span>Region</span>
              <input maxLength={120} value={draft.region} onChange={(event) => updateDraft("region", event.target.value)} placeholder="e.g. West Africa / East Africa" />
            </label>
            <label>
              <span>Sector *</span>
              <input required minLength={2} maxLength={120} value={draft.sector} onChange={(event) => updateDraft("sector", event.target.value)} placeholder="e.g. Fintech, Energy, Media" />
            </label>
            <label>
              <span>Opportunity Type *</span>
              <input required minLength={2} maxLength={120} value={draft.opportunity_type} onChange={(event) => updateDraft("opportunity_type", event.target.value)} placeholder="e.g. Grant, Investment, Accelerator" />
            </label>
          </div>

          <label className={styles.fullWidthLabel}>
            <span>Description *</span>
            <textarea required minLength={10} maxLength={12000} rows={5} value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} placeholder="Provide full details about the opportunity, criteria, and benefits..." />
          </label>

          <label className={styles.fullWidthLabel}>
            <span>Who This Is For *</span>
            <textarea required minLength={5} maxLength={3000} rows={3} value={draft.who_this_is_for} onChange={(event) => updateDraft("who_this_is_for", event.target.value)} placeholder="Describe eligible profiles or founders..." />
            <small className={styles.fieldHint}>Outline target participants without disclosing unapproved principals.</small>
          </label>

          <fieldset className={`${styles.questionsSection} tap-in-admin-questions`}>
            <legend>Custom Enquiry Questions (2–4)</legend>
            {draft.enquiry_questions.map((question, index) => (
              <div className={`${styles.questionRow} tap-in-admin-question-row`} key={index}>
                <label className={styles.questionInputLabel}>
                  <span>Question {index + 1}</span>
                  <input required minLength={3} maxLength={500} value={question} onChange={(event) => changeQuestion(index, event.target.value)} placeholder={`Enter question ${index + 1} for applicants...`} />
                </label>
                {draft.enquiry_questions.length > 2 ? (
                  <button type="button" className={styles.removeQuestionBtn} onClick={() => removeQuestion(index)} aria-label={`Remove question ${index + 1}`}>
                    ✕ Remove
                  </button>
                ) : null}
              </div>
            ))}
            {draft.enquiry_questions.length < 4 ? (
              <button type="button" className={styles.secondaryBtn} onClick={addQuestion}>
                + Add Another Question
              </button>
            ) : null}
          </fieldset>

          <details className={`${styles.optional} tap-in-admin-optional`}>
            <summary>🖼️ Images & SEO Metadata (Optional)</summary>
            <div className={`${styles.formGrid} tap-in-admin-form-grid`}>
              <label>
                <span>Opportunity Image URL</span>
                <input type="url" value={draft.image_url} onChange={(event) => updateDraft("image_url", event.target.value)} placeholder="https://..." />
              </label>
              <label>
                <span>Share Image URL (OG Image)</span>
                <input type="url" value={draft.share_image_url} onChange={(event) => updateDraft("share_image_url", event.target.value)} placeholder="https://..." />
              </label>
              <label>
                <span>SEO Title</span>
                <input maxLength={180} value={draft.seo_title} onChange={(event) => updateDraft("seo_title", event.target.value)} placeholder="Optimized title for search engines" />
              </label>
              <label className={styles.fullWidthLabel}>
                <span>SEO Description</span>
                <textarea rows={2} maxLength={320} value={draft.seo_description} onChange={(event) => updateDraft("seo_description", event.target.value)} placeholder="Short meta description..." />
              </label>
            </div>
          </details>

          <div className={`${styles.formFooter} tap-in-admin-form-footer`}>
            <label className={styles.statusSelectLabel}>
              <span>Status</span>
              <select value={draft.status} onChange={(event) => updateDraft("status", event.target.value as Status)}>
                <option value="draft">Draft</option>
                <option value="live">Live</option>
                <option value="closed">Closed</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <button className={styles.primaryBtn} type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save Changes" : "Create Opportunity"}
            </button>
          </div>
          
          <p className={styles.privacyNote}>🔒 Note: Closing a listing keeps its URL active while gracefully directing potential applicants toward current live opportunities.</p>
        </form>
      </section>
    </main>
  );
}