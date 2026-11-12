// FILE PATH: src/components/admin/AdminModuleClient.tsx
"use client";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import { DETAILS, FIELDS, SETTINGS_TABS, STATUS_OPTIONS, TAP_IN_KINDS, enquiryKind, subscriberList, subscriberListLabel, text, tone, slugify, today, todayDateTime, toLocalDateTime, defaultSiteSettings, toDraft, makeData, type CmsRecord, type Draft, type Field, type ModuleKey } from "./admin-module-config";

export default function AdminModuleClient({ moduleKey }: { moduleKey: ModuleKey }) {
  const meta = DETAILS[moduleKey];
  const fields = FIELDS[moduleKey] ?? [];
  const editable = Boolean(FIELDS[moduleKey]);
  const [records, setRecords] = useState<CmsRecord[]>([]);
  const [draft, setDraft] = useState<Draft>(() => moduleKey === "site-settings" ? defaultSiteSettings() : toDraft(undefined, moduleKey));
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverPreview, setCoverPreview] = useState("");
  const [githubAssetPath, setGithubAssetPath] = useState("");
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState(SETTINGS_TABS[0].id);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [sendingArticleId, setSendingArticleId] = useState("");

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ status: statusFilter, ...(search.trim() ? { search: search.trim() } : {}) });
      const response = await fetch(`/api/admin/cms/${moduleKey}?${query.toString()}`, { cache: "no-store" });
      const data = await response.json() as { records?: CmsRecord[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Could not load this module.");
      const loaded = Array.isArray(data.records) ? data.records : [];
      setRecords(loaded);
      if (moduleKey === "site-settings") {
        // The Site & SEO page edits the saved record in place, so keep the form in step with what is saved.
        setDraft(loaded[0] ? toDraft(loaded[0], moduleKey) : defaultSiteSettings());
        setDirty(false);
      }
      setNotice((current) => current?.tone === "error" ? null : current);
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Could not load this module." });
    } finally { setLoading(false); }
  }, [moduleKey, search, statusFilter]);

  // Fetch-on-mount: loadRecords updates loading state before the request starts.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { document.title = `${meta.title} | Africa Plug Admin`; void loadRecords(); }, [loadRecords, meta.title]);

  // Enquiries can be narrowed to one T.A.P IN form, and subscribers to the T.A.P IN alerts list.
  const shown = useMemo(() => {
    if (groupFilter === "all") return records;
    if (moduleKey === "enquiries") return records.filter((record) => enquiryKind(record) === groupFilter);
    if (moduleKey === "subscribers") return records.filter((record) => subscriberList(record) === groupFilter);
    return records;
  }, [records, groupFilter, moduleKey]);

  const stats = useMemo(() => ({
    total: shown.length,
    waiting: shown.filter((record) => ["review-required", "pending", "submitted", "new"].includes(record.status)).length,
    published: shown.filter((record) => ["published", "active", "approved"].includes(record.status)).length,
  }), [shown]);

  function updateField(key: string, value: unknown) {
    setDirty(true);
    setDraft((current) => ({ ...current, data: { ...current.data, [key]: value } }));
  }

  function clearCoverPreview() {
    if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    setCoverPreview("");
  }

  function newRecord() {
    clearCoverPreview();
    const next = toDraft(undefined, moduleKey);
    if (moduleKey === "blog") next.data = { category: "Business", author: "FK", publishedAt: todayDateTime(), featureOnHomepage: false, tagsText: "", body: "", excerpt: "", image: "", imageAlt: "", imageCredit: "", takeaway: "", seoTitle: "", seoDescription: "", shareImage: "" };
    if (moduleKey === "store") { next.status = "active"; next.data = { summary: "", description: "", price: 0, currency: "GBP", imageUrl: "", imageAlt: "", productType: "Guide", availability: "coming-soon", externalUrl: "", productFileReference: "", seoTitle: "", seoDescription: "", featured: false }; }
    if (moduleKey === "subscribers") next.data = { email: "", name: "", source: "Admin" };
    if (moduleKey === "settings") { next.title = "Commercial settings"; next.slug = "commercial-settings"; next.data = { consultationFee: "", depositAmount: "", currency: "GBP", meetingMinutes: 60, bookingUrl: "", cancellationTerms: "", rescheduleTerms: "", noShowTerms: "" }; }
    setDraft(next);
    setEditing(false);
    setEditorOpen(true);
    setNotice(null);
  }

  function editRecord(record: CmsRecord) {
    clearCoverPreview();
    setDraft(toDraft(record, moduleKey));
    setEditing(true);
    setEditorOpen(true);
    setNotice(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editSettings() {
    if (records[0]) editRecord(records[0]);
    else newRecord();
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    const data = makeData(moduleKey, draft);
    const email = text(data.email).trim().toLowerCase();
    const title = (draft.title.trim() || email || "Untitled record").slice(0, 240);
    let slug = draft.slug.trim() || slugify(title);
    if (moduleKey === "settings") slug = "commercial-settings";
    if (moduleKey === "site-settings") slug = "site-settings";
    if (moduleKey === "subscribers") slug = slugify(email);
    if ((moduleKey === "blog" || moduleKey === "store") && !slug) {
      setNotice({ tone: "error", text: "Add a title so a page URL can be generated." });
      setSaving(false);
      return;
    }
    if (moduleKey === "subscribers" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNotice({ tone: "error", text: "Enter a valid subscriber email address." });
      setSaving(false);
      return;
    }
    const record = { ...(draft.id ? { id: draft.id } : {}), title, slug: slug || null, status: draft.status || "draft", data };
    try {
      const response = await fetch(`/api/admin/cms/${moduleKey}`, {
        method: draft.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft.id ? { id: draft.id, record } : { record }),
      });
      const result = await response.json() as { record?: CmsRecord; error?: string };
      if (!response.ok) throw new Error(result.error || "Could not save changes.");
      if (moduleKey === "blog" && data.featureOnHomepage === true && result.record?.id && result.record.status === "published") {
        const featureResponse = await fetch("/api/admin/blog/feature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ articleId: result.record.id }),
        });
        const featureResult = await featureResponse.json() as { error?: string };
        if (!featureResponse.ok) throw new Error(featureResult.error || "Article saved, but the homepage feature could not be updated.");
      }
      setNotice({ tone: "success", text: moduleKey === "site-settings" ? "Settings saved. The site will use them on the next page load." : editing ? "Changes saved." : "Record created and saved." });
      setEditorOpen(false);
      setEditing(false);
      await loadRecords();
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Could not save changes." });
    } finally { setSaving(false); }
  }

  async function sendArticleEmail(record: CmsRecord) {
    if (sendingArticleId) return;
    setSendingArticleId(record.id);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/blog/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: record.id }),
      });
      const result = await response.json() as { error?: string; sent?: number; message?: string };
      if (!response.ok) throw new Error(result.error || "The article email could not be sent.");
      setNotice({ tone: "success", text: result.message || "Article announcement sent to " + (result.sent ?? 0) + " Blog readers." });
      await loadRecords();
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "The article email could not be sent." });
    } finally {
      setSendingArticleId("");
    }
  }

  function exportBlogReaders() {
    const rows = shown.filter((record) => subscriberList(record) === "blog");
    const quote = (value: unknown) => '"' + text(value).replace(/"/g, '""') + '"';
    const data = [["Email","Name","Status","Joined","Source"], ...rows.map((record) => [
      text(record.data.email), text(record.data.name), record.status, record.created_at, text(record.data.source)
    ])];
    const blob = new Blob(["\uFEFF" + data.map((row) => row.map(quote).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "the-africa-plug-blog-readers.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function setStatus(record: CmsRecord, status: string) {
    const actionLabel = status === "approved" ? "approve" : status === "declined" ? "decline" : status === "resolved" ? "resolve" : status === "unsubscribed" ? "unsubscribe" : "update";
    if ((status === "declined" || status === "archived") && !window.confirm(`Are you sure you want to ${actionLabel} “${record.title}”?`)) return;
    setNotice(null);
    try {
      const isApplicationDecision = (moduleKey === "work-with-fk" || moduleKey === "review-required") && (status === "approved" || status === "declined");
      const isBlogOptOut = moduleKey === "subscribers" && record.data?.list === "blog" && status === "unsubscribed";
      const patchBody = isBlogOptOut
        ? {
            id: record.id,
            record: {
              id: record.id,
              title: record.title,
              slug: record.slug,
              status: "unsubscribed",
              data: { ...record.data, consent: false, subscriptionStatus: "unsubscribed", unsubscribedAt: new Date().toISOString() },
            },
          }
        : { id: record.id, status };
      const response = await fetch(isApplicationDecision ? "/api/work-with-fk/approve" : `/api/admin/cms/${moduleKey}`, {
        method: isApplicationDecision ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isApplicationDecision ? { id: record.id, decision: status } : patchBody),
      });
      const data = await response.json() as { error?: string; message?: string };
      if (!response.ok) throw new Error(data.error || "Could not update status.");
      setNotice({ tone: "success", text: isApplicationDecision && data.message ? data.message : `Status updated to ${status.replace(/-/g, " ")}.` });
      await loadRecords();
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Could not update status." });
    }
  }

  async function setProductAvailability(record: CmsRecord, availability: "available" | "coming-soon") {
    if (availability === "available" && record.data?.productType === "Guide") {
      const fileRef = text(record.data?.productFileReference);
      if (!record.slug || !fileRef.startsWith(record.slug + "/")) {
        setNotice({ tone: "error", text: "Upload and save this guide's protected PDF, EPUB or ZIP file before marking it Available. The release action also emails paid preorder customers their private links." });
        return;
      }
      await releaseStoreProduct(record);
      return;
    }

    try {
      const response = await fetch("/api/admin/cms/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: record.id, record: { id: record.id, title: record.title, slug: record.slug, status: record.status, data: { ...record.data, availability } } }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not update product availability.");
      setNotice({ tone: "success", text: `${record.title} set to ${availability === "available" ? "Available" : "Coming soon"}.` });
      await loadRecords();
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Could not update product availability." });
    }
  }

  async function removeRecord(record: CmsRecord) {
    if (!window.confirm(`Delete “${record.title}”? This cannot be undone.`)) return;
    try {
      const response = await fetch(`/api/admin/cms/${moduleKey}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: record.id }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not delete record.");
      setNotice({ tone: "success", text: "Record deleted." });
      await loadRecords();
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Could not delete record." });
    }
  }

  async function uploadAsset(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setNotice(null);
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body: form });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Upload failed.");
      setNotice({ tone: "success", text: `${file.name} uploaded and added to the media library.` });
      event.target.value = "";
      if (moduleKey === "media") await loadRecords();
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Upload failed." });
    } finally { setUploading(false); }
  }

  async function registerGithubAsset() {
    const url = githubAssetPath.trim();
    if (!/^\/(?:Image|images)\/[a-zA-Z0-9_./-]+\.(?:jpe?g|png|webp|avif|gif|svg)$/i.test(url) || url.includes("..") || url.includes("//")) {
      setNotice({ tone: "error", text: "Enter a valid public image path, e.g. /Image/Store/cover.jpg." });
      return;
    }
    setUploading(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not register the GitHub image.");
      setGithubAssetPath("");
      setNotice({ tone: "success", text: "GitHub image path added to the media library. No Blob operation was used." });
      await loadRecords();
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Could not register the GitHub image." });
    } finally {
      setUploading(false);
    }
  }

  async function uploadProductCover(event: ChangeEvent<HTMLInputElement>, fieldKey = "imageUrl") {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      setNotice({ tone: "error", text: "Choose a JPG, PNG, WebP or AVIF image." });
      input.value = "";
      return;
    }
    if (file.size <= 0 || file.size > 20 * 1024 * 1024) {
      setNotice({ tone: "error", text: "The cover image must be smaller than 20 MB." });
      input.value = "";
      return;
    }
    const localPreview = URL.createObjectURL(file);
    clearCoverPreview();
    setCoverPreview(localPreview);
    setUploading(true);
    setNotice(null);
    try {
      const prepareResponse = await fetch("/api/admin/store-covers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-upload", fileName: file.name, contentType: file.type, size: file.size }),
      });
      const prepared = await prepareResponse.json() as { error?: string; bucket?: string; path?: string; token?: string; supabaseUrl?: string; anonKey?: string };
      if (!prepareResponse.ok) throw new Error(prepared.error || "Could not prepare the product cover upload.");
      if (!prepared.bucket || !prepared.path || !prepared.token || !prepared.supabaseUrl || !prepared.anonKey) {
        throw new Error("Supabase did not return a complete signed upload.");
      }

      const storageClient = createClient(prepared.supabaseUrl, prepared.anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error: storageError } = await storageClient.storage
        .from(prepared.bucket)
        .uploadToSignedUrl(prepared.path, prepared.token, file, {
          contentType: file.type,
          cacheControl: "3600",
        });
      if (storageError) throw new Error(storageError.message || "Supabase could not store the product cover.");

      const finishResponse = await fetch("/api/admin/store-covers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "finalize-upload",
          path: prepared.path,
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });
      const result = await finishResponse.json() as { error?: string; record?: CmsRecord };
      if (!finishResponse.ok) throw new Error(result.error || "The uploaded cover could not be attached to the media library.");
      const url = text(result.record?.data?.url);
      if (!url) throw new Error("The image uploaded but no public image URL was returned.");
      updateField(fieldKey, url);
      if (!text(draft.data.imageAlt)) updateField("imageAlt", file.name.replace(/\\.[^.]+$/, "").replace(/[-_]+/g, " "));
      URL.revokeObjectURL(localPreview);
      setCoverPreview("");
      setNotice({ tone: "success", text: "Product cover uploaded and attached. Save the product to publish the change." });
      input.value = "";
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Cover image upload failed." });
    } finally {
      setUploading(false);
    }
  }

  async function uploadStoreProductFile(event: ChangeEvent<HTMLInputElement>, record: CmsRecord) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    if (!record.slug) {
      setNotice({ tone: "error", text: "Save this product with a URL slug before uploading its protected file." });
      input.value = "";
      return;
    }
    setUploading(true);
    setNotice(null);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("slug", record.slug);
      const response = await fetch("/api/admin/store-files", { method: "POST", body: form });
      const data = await response.json() as { error?: string; path?: string; message?: string };
      if (!response.ok) throw new Error(data.error || "Protected upload failed.");
      setNotice({ tone: "success", text: data.message || "Protected product file uploaded." });
      await loadRecords();
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Protected upload failed." });
    } finally {
      input.value = "";
      setUploading(false);
    }
  }

  async function releaseStoreProduct(record: CmsRecord) {
    if (!record.slug || typeof record.data?.productFileReference !== "string" || !record.data.productFileReference.startsWith(record.slug + "/")) {
      setNotice({ tone: "error", text: "Upload the protected guide file before releasing this product." });
      return;
    }
    if (!window.confirm(`Release “${record.title}” and email private download links to every paid preorder customer?`)) return;
    setUploading(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/store-release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: record.slug }),
      });
      const result = await response.json() as { error?: string; emailed?: number; skipped?: number };
      if (!response.ok) throw new Error(result.error || "The guide could not be released.");
      setNotice({ tone: "success", text: `Guide released. ${result.emailed ?? 0} preorder customer(s) emailed.` });
      await loadRecords();
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "The guide could not be released." });
    } finally {
      setUploading(false);
    }
  }

  async function viewStoreDownloadActivity(record: CmsRecord) {
    if (!record.slug) return;
    try {
      const response = await fetch(`/api/admin/store-downloads?slug=${encodeURIComponent(record.slug)}`, { cache: "no-store" });
      const result = await response.json() as { error?: string; records?: Array<{ customer_email: string; download_count: number; first_opened_at: string | null; expires_at: string; email_sent_at: string | null }> };
      if (!response.ok) throw new Error(result.error || "Could not load download activity.");
      const rows = result.records ?? [];
      const opened = rows.filter((row) => row.first_opened_at);
      const summary = rows.length
        ? rows.map((row) => `${row.customer_email}: ${row.download_count}/5 downloads; first opened ${row.first_opened_at ? new Date(row.first_opened_at).toLocaleString("en-GB") : "not opened"}; expires ${new Date(row.expires_at).toLocaleDateString("en-GB")}`).join(" | ")
        : "No preorder download links have been issued yet.";
      setNotice({ tone: "success", text: `Download activity: ${opened.length} opened of ${rows.length} issued. ${summary}` });
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Could not load download activity." });
    }
  }

  function recordSummary(record: CmsRecord) {
    const data = record.data ?? {};
    const fields = [data.email, data.organisation, data.organization, data.opportunityName, data.productTitle, data.category, data.excerpt, data.summary, data.path, data.eventName];
    return fields.map(text).filter(Boolean).join(" · ");
  }

  /** One form control, used by both the modal editor and the inline Site & SEO form. */
  function renderField(field: Field) {
    const value = draft.data[field.key];
    if (field.type === "image-upload") {
      const imageSrc = coverPreview || text(value);
      return (
        <div key={field.key} className="apm-cover-field">
          <span className="apm-label">{field.label}</span>
          <div className="apm-cover-upload">
            {imageSrc ? (
              <div className="apm-cover-preview">
                <img src={imageSrc} alt={text(draft.data.imageAlt) || "Product cover preview"} />
                <div className="apm-cover-actions">
                  <span className="apm-help">{coverPreview ? "Previewing selected image" : "Current product cover"}</span>
                  <button type="button" className="apm-btn" onClick={() => { clearCoverPreview(); updateField(field.key, ""); }}>Remove image</button>
                </div>
              </div>
            ) : <p className="apm-muted">No cover image selected yet.</p>}
            <label className={`apm-btn apm-btn-primary${uploading ? " is-busy" : ""}`}>
              {uploading ? "Uploading cover…" : imageSrc ? "Replace cover image" : "Upload product cover"}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading} onChange={(event) => void uploadProductCover(event, field.key)} />
            </label>
          </div>
          <label className="apm-label" htmlFor={`github-image-path-${field.key}`}>Or use a GitHub Image Library path</label>
          <input
            id={`github-image-path-${field.key}`}
            className="apm-input"
            value={text(value).startsWith("/Image/") || text(value).startsWith("/images/") ? text(value) : ""}
            onChange={(event) => updateField(field.key, event.target.value)}
            placeholder="/Image/Store/cover.jpg"
            aria-label={`GitHub image path for ${field.label}`}
          />
          <small className="apm-help">Use a path committed under public/Image (or an existing public/images asset). Uploaded covers are stored in the separate public Supabase media bucket; paid guide files remain private.</small>
          {field.help ? <small className="apm-help">{field.help}</small> : null}
        </div>
      );
    }
    return (
      <label key={field.key} className={field.type === "textarea" ? "is-wide" : undefined}>
        {field.type === "checkbox" ? (
          <span className="apm-check"><input type="checkbox" checked={Boolean(value)} onChange={(event) => updateField(field.key, event.target.checked)} /><span>{field.label}</span></span>
        ) : (
          <>
            <span className="apm-label">{field.label}</span>
            {field.type === "textarea"
              ? <textarea rows={field.rows ?? 3} className="apm-input apm-textarea" value={text(value)} onChange={(event) => updateField(field.key, event.target.value)} placeholder={field.placeholder} />
              : field.type === "select"
                ? <select className="apm-input" value={text(value) || field.options?.[0]?.value || ""} onChange={(event) => updateField(field.key, event.target.value)}>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                : <input className="apm-input" type={field.type === "number" || field.type === "date" || field.type === "datetime-local" || field.type === "url" ? field.type : "text"} value={text(value)} onChange={(event) => updateField(field.key, event.target.value)} placeholder={field.placeholder} required={field.key === "email" || field.key === "excerpt" || (moduleKey === "blog" && field.key === "category")} />}
          </>
        )}
        {field.help ? <small className="apm-help">{field.help}</small> : null}
      </label>
    );
  }

  // ---------- Site & SEO settings: edited inline, saved as one record ----------
  if (moduleKey === "site-settings") {
    const saved = records[0];
    const data = draft.data;
    const filled = (key: string) => text(data[key]).trim().length > 0;
    const profileKeys = ["siteTitle", "siteDescription", "contactEmail", "whatsappUrl"];
    const profilePercent = Math.round((profileKeys.filter(filled).length / profileKeys.length) * 100);
    const switches = ["enableNewsletter", "enableSearch", "enableSelectedWork", "enableProductOfMonth"];
    const switchesOn = switches.filter((key) => Boolean(data[key])).length;
    const potmReady = filled("potmName") && filled("potmWriteUp") && /^https:\/\//i.test(text(data.potmUrl).trim());
    const activeTab = SETTINGS_TABS.find((item) => item.id === tab) ?? SETTINGS_TABS[0];
    const tabFields = activeTab.keys.map((key) => fields.find((field) => field.key === key)).filter((field): field is Field => Boolean(field));
    const checklist = [
      { ok: filled("siteTitle"), label: "Site title is set" },
      { ok: text(data.siteDescription).trim().length >= 50, label: "SEO description is 50+ characters" },
      { ok: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(data.contactEmail).trim()), label: "Public contact email is valid" },
      { ok: ["linkedinUrl", "instagramUrl", "footerYoutubeUrl", "tiktokUrl", "facebookUrl"].every((key) => !text(data[key]).trim() || /^https:\/\//i.test(text(data[key]).trim())), label: "Footer social links use secure HTTPS URLs" },
      { ok: filled("navigationText"), label: "Navigation links are set" },
      { ok: !data.enableProductOfMonth || potmReady, label: data.enableProductOfMonth ? "Product of the Month is complete" : "Product of the Month is off" },
    ];

    return (
      <div className="apm">
        <div className="apm-head">
          <div>
            <p className="apm-eyebrow">SITE CONTROL</p>
            <h1>{meta.title}</h1>
            <p>{meta.description}</p>
          </div>
          <div className="apm-head-actions">
            <Link className="apm-btn" href="/" target="_blank" rel="noreferrer">Preview site ↗</Link>
            <button type="submit" form="site-settings-form" className="apm-btn apm-btn-primary" disabled={saving || loading}>{saving ? "Saving…" : dirty ? "Save changes" : "Save"}</button>
          </div>
        </div>

        {notice ? <p role="status" className={`apm-notice is-${notice.tone}`}>{notice.text}</p> : null}

        <div className="apm-stats">
          <div className="apm-stat"><small>Settings record</small><strong className={saved ? "is-ok" : undefined}>{loading ? "…" : saved ? "Saved" : "Not set up"}</strong></div>
          <div className="apm-stat"><small>Profile complete</small><strong>{profilePercent}%</strong></div>
          <div className="apm-stat"><small>Features on</small><strong>{switchesOn} of {switches.length}</strong></div>
          <div className="apm-stat"><small>Last updated</small><strong>{saved?.updated_at ? new Date(saved.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "–"}</strong></div>
        </div>

        <div className="apm-tabs" role="tablist" aria-label="Settings sections">
          {SETTINGS_TABS.map((item) => (
            <button key={item.id} type="button" role="tab" id={`tab-${item.id}`} aria-selected={item.id === activeTab.id} aria-controls="site-settings-form" className={`apm-tab${item.id === activeTab.id ? " is-on" : ""}`} onClick={() => setTab(item.id)}>{item.label}</button>
          ))}
        </div>

        <div className="apm-set-grid">
          <form id="site-settings-form" onSubmit={save} className="apm-card apm-panel" role="tabpanel" aria-labelledby={`tab-${activeTab.id}`}>
            <div className="apm-panel-head">
              <div><h2>{activeTab.label}</h2><p className="apm-muted">{activeTab.blurb}</p></div>
              {dirty ? <span className="apm-tag is-warn">Unsaved changes</span> : <span className="apm-tag is-ok">Up to date</span>}
            </div>
            {loading ? <p className="apm-muted">Loading your settings…</p> : <div className="apm-form-grid">{tabFields.map(renderField)}</div>}
            <div className="apm-panel-foot">
              <button type="button" className="apm-btn" disabled={!dirty || loading} onClick={() => void loadRecords()}>Discard changes</button>
              <button type="submit" className="apm-btn apm-btn-primary" disabled={saving || loading}>{saving ? "Saving…" : "Save changes"}</button>
            </div>
          </form>

          <aside className="apm-side">
            <section className="apm-card apm-quick">
              <h2>Quick actions</h2>
              <Link className="apm-btn" href="/" target="_blank" rel="noreferrer">View live site ↗</Link>
              <Link className="apm-btn" href="/store" target="_blank" rel="noreferrer">View store ↗</Link>
              <button type="button" className="apm-btn" onClick={() => void loadRecords()}>Reload saved settings</button>
            </section>
            <section className="apm-card apm-quick">
              <h2>Readiness check</h2>
              <ul className="apm-checklist">
                {checklist.map((item) => <li key={item.label} className={item.ok ? "is-ok" : "is-todo"}><span aria-hidden="true">{item.ok ? "✓" : "○"}</span><span>{item.label}<span className="apm-sr"> {item.ok ? "(done)" : "(to do)"}</span></span></li>)}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    );
  }

  // ---------- All other modules ----------
  return (
    <div className="apm">
      <div className="apm-head">
        <div>
          <h1>{meta.title}</h1>
          <p>{meta.description}</p>
        </div>
        <div className="apm-head-actions">
          {moduleKey === "review-required" ? <Link className="apm-btn" href="/admin/work-with-fk">All applications ↗</Link> : null}
          {moduleKey === "blog" ? <Link className="apm-btn" href="/blog" target="_blank" rel="noreferrer">View journal ↗</Link> : null}
          {moduleKey === "store" ? <Link className="apm-btn" href="/store" target="_blank" rel="noreferrer">View store ↗</Link> : null}
          {editable && moduleKey !== "settings" ? <button type="button" className="apm-btn apm-btn-primary" onClick={newRecord}>+ Add {moduleKey === "blog" ? "article" : moduleKey === "store" ? "product" : "subscriber"}</button> : null}
          {moduleKey === "settings" ? <button type="button" className="apm-btn apm-btn-primary" onClick={editSettings}>{records.length ? "Edit settings" : "Set up settings"}</button> : null}
        </div>
      </div>

      <div className="apm-stats">
        <div className="apm-stat"><small>Records in view</small><strong>{stats.total}</strong></div>
        <div className="apm-stat"><small>Need attention</small><strong>{stats.waiting}</strong></div>
        <div className="apm-stat"><small>Live / active</small><strong>{stats.published}</strong></div>
      </div>

      {notice ? <p role="status" className={`apm-notice is-${notice.tone}`}>{notice.text}</p> : null}

      <section>
        <div className="apm-toolbar">
          {STATUS_OPTIONS[moduleKey] ? <div className="apm-chips" role="group" aria-label="Filter by status">
            <button type="button" className={`apm-chip${statusFilter === "all" ? " is-on" : ""}`} aria-pressed={statusFilter === "all"} onClick={() => setStatusFilter("all")}>All</button>
            {STATUS_OPTIONS[moduleKey]!.map((option) => <button type="button" key={option.value} className={`apm-chip${statusFilter === option.value ? " is-on" : ""}`} aria-pressed={statusFilter === option.value} onClick={() => setStatusFilter(option.value)}>{option.label}</button>)}
          </div> : <p className="apm-count">{loading ? "Loading…" : `${shown.length} record${shown.length === 1 ? "" : "s"}`}</p>}
          <input className="apm-input apm-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records…" aria-label="Search records" />
          <button type="button" className="apm-btn" onClick={() => void loadRecords()}>Refresh</button>
        </div>

        {moduleKey === "enquiries" || moduleKey === "subscribers" ? <div className="apm-chips" role="group" aria-label={moduleKey === "enquiries" ? "Filter by form" : "Filter by list"} style={{ marginBottom: 14 }}>
          {(moduleKey === "enquiries"
            ? [{ value: "all", label: "All forms" }, ...TAP_IN_KINDS, { value: "article-pitch", label: "Article pitches" }, { value: "other", label: "Other forms" }]
            : [{ value: "all", label: "All lists" }, { value: "blog", label: "Blog readers" }, { value: "tap-in-alerts", label: "T.A.P IN alerts" }, { value: "other", label: "Stay Plugged In" }]
          ).map((option) => <button type="button" key={option.value} className={`apm-chip${groupFilter === option.value ? " is-on" : ""}`} aria-pressed={groupFilter === option.value} onClick={() => setGroupFilter(option.value)}>{option.label}</button>)}
        </div> : null}
        {moduleKey === "subscribers" && groupFilter === "blog" ? <div style={{ marginBottom: 14 }}><button type="button" className="apm-btn" onClick={exportBlogReaders} disabled={!shown.length}>Export Blog readers CSV</button></div> : null}

        {moduleKey === "media" ? <section className="apm-card apm-upload">
          <h3>Use either image source</h3>
          <p className="apm-muted">Blob uploads remain available when Vercel Blob is active. Repository images can be registered by path without using Blob operations.</p>
          <label className="apm-btn apm-btn-primary">
            {uploading ? "Uploading…" : "Choose and upload to Vercel Blob"}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,application/pdf" disabled={uploading} onChange={(event) => void uploadAsset(event)} style={{ display: "none" }} />
          </label>
          <div className="apm-form-fields" style={{ marginTop: 18 }}>
            <label className="is-wide">
              <span className="apm-label">GitHub Image Library path</span>
              <input className="apm-input" value={githubAssetPath} onChange={(event) => setGithubAssetPath(event.target.value)} placeholder="/Image/Store/cover.jpg" />
              <small className="apm-help">Add the image to the repository's public/Image folder first, then register its path here. Supported paths begin with /Image/ or /images/.</small>
            </label>
          </div>
          <button type="button" className="apm-btn" disabled={uploading || !githubAssetPath.trim()} onClick={() => void registerGithubAsset()}>Add GitHub image path</button>
        </section> : null}

        {moduleKey === "analytics" && records.length ? <div className="apm-stats">
          {["page_view", "article_view", "product_view", "form_submit"].map((eventName) => <div key={eventName} className="apm-stat"><small>{eventName.replace(/_/g, " ")}</small><strong>{records.filter((r) => r.data?.eventName === eventName).length}</strong></div>)}
        </div> : null}

        {shown.length ? <div className="apm-card apm-list">
          {shown.map((record) => <article key={record.id} className="apm-row">
            <div className={moduleKey === "store" ? "apm-row-main apm-row-main-store" : "apm-row-main"}>
              {moduleKey === "store" ? (
                <div className="apm-store-row-image">
                  {text(record.data?.imageUrl).trim()
                    ? <img src={text(record.data.imageUrl).trim()} alt={`Cover for ${record.title}`} loading="lazy" />
                    : <span>No cover image</span>}
                </div>
              ) : null}
              <div className={moduleKey === "store" ? "apm-store-row-details" : undefined}>
              <div className="apm-row-meta">
                <span className={`apm-tag ${moduleKey === "store" && record.status === "draft" ? "is-neutral" : `is-${tone(record.status)}`}`}>{moduleKey === "store" && record.status === "draft" ? "Not listed (draft)" : record.status.replace(/-/g, " ")}</span>
                {moduleKey === "enquiries" && enquiryKind(record) !== "other" ? <span className="apm-tag is-neutral">{TAP_IN_KINDS.find((item) => item.value === enquiryKind(record))?.label || (enquiryKind(record) === "article-pitch" ? "Article pitch" : "Other")}</span> : null}
                {moduleKey === "subscribers" && subscriberList(record) !== "other" ? <span className="apm-tag is-neutral">{subscriberListLabel(record)}</span> : null}
                <small>{new Date(record.updated_at).toLocaleString("en-GB")}</small>
              </div>
              <h3>{record.title || "Untitled record"}</h3>
              {recordSummary(record) ? <p className="apm-summary">{recordSummary(record)}</p> : null}
              {moduleKey === "blog" || moduleKey === "store" ? <small className="apm-url">URL: /{moduleKey === "blog" ? "blog" : "store"}/{record.slug}</small> : null}
              {moduleKey === "blog" && record.data?.featureOnHomepage === true ? <span className="apm-tag is-neutral">Homepage feature</span> : null}
              {moduleKey === "blog" && record.status === "published" && text(record.data?.publishedAt) && Date.parse(text(record.data.publishedAt)) > Date.now() ? <span className="apm-tag is-warn">Scheduled</span> : null}
              {moduleKey === "store" ? <>
                <span className={`apm-tag ${record.data?.availability === "available" ? "is-ok" : "is-warn"}`}>{record.data?.availability === "available" ? "Available" : "Coming soon"}</span>
                <small className={`apm-file ${record.data?.productFileReference ? "is-ok" : "is-warn"}`}>{record.data?.productFileReference ? "Protected file uploaded" : "No protected file uploaded yet"}</small>
              </> : null}
              {moduleKey === "media" && typeof record.data?.url === "string" ? <a className="apm-link" href={record.data.url} target="_blank" rel="noreferrer">Open asset ↗</a> : null}
              {(moduleKey === "enquiries" || moduleKey === "work-with-fk" || moduleKey === "review-required") ? <details className="apm-details"><summary>Read submission details</summary><dl>{Object.entries(record.data ?? {}).filter(([key, value]) => value !== null && value !== "" && !["turnstileToken", "website"].includes(key) && typeof value !== "object").map(([key, value]) => <div key={key} className="apm-dl-row"><dt>{key.replace(/([A-Z])/g, " $1")}</dt><dd>{String(value)}</dd></div>)}</dl></details> : null}
              {moduleKey === "analytics" ? <details className="apm-details"><summary>View source and UTM details</summary><pre className="apm-pre">{JSON.stringify(record.data, null, 2)}</pre></details> : null}
              {moduleKey === "subscribers" ? <><p className="apm-url">{text(record.data?.source) || "Source not recorded"}</p>{record.data?.consentText ? <details className="apm-details"><summary>View consent record</summary><dl><div className="apm-dl-row"><dt>Wording</dt><dd>{text(record.data.consentText)}</dd></div><div className="apm-dl-row"><dt>Version</dt><dd>{text(record.data.consentVersion)}</dd></div><div className="apm-dl-row"><dt>Consented at</dt><dd>{text(record.data.consentedAt)}</dd></div></dl></details> : null}</> : null}
              </div>
            </div>
            <div className="apm-actions">
              {editable && moduleKey !== "store" ? <button type="button" className="apm-btn" onClick={() => editRecord(record)}>Edit</button> : null}
              {moduleKey === "store" ? <>
                <button type="button" className={`apm-btn${record.data?.availability === "available" ? " apm-btn-ok" : ""}`} aria-pressed={record.data?.availability === "available"} onClick={() => void setProductAvailability(record, "available")}>Available</button>
                <button type="button" className={`apm-btn${record.data?.availability !== "available" ? " apm-btn-ok" : ""}`} aria-pressed={record.data?.availability !== "available"} onClick={() => void setProductAvailability(record, "coming-soon")}>Coming soon</button>
                <button type="button" className="apm-btn apm-btn-danger" onClick={() => void removeRecord(record)}>Delete</button>
                <button type="button" className="apm-btn" disabled={record.status === "archived"} onClick={() => void setStatus(record, "archived")}>Archive</button>
                <button type="button" className="apm-btn" onClick={() => editRecord(record)}>Edit details</button>
                {record.data?.productType === "Guide" ? <button type="button" className="apm-btn" onClick={() => void viewStoreDownloadActivity(record)}>Download activity</button> : null}
              </> : null}
              {moduleKey === "store" ? <label className={`apm-btn apm-btn-file${uploading ? " is-busy" : ""}`}>{uploading ? "Uploading…" : "Upload protected file"}<input type="file" accept=".pdf,.epub,.zip,application/pdf,application/epub+zip,application/zip" disabled={uploading} onChange={(event) => void uploadStoreProductFile(event, record)} style={{ display: "none" }} /></label> : null}
              {(moduleKey === "work-with-fk" || moduleKey === "review-required") && ["review-required", "pending", "submitted", "new"].includes(record.status) ? <><button type="button" className="apm-btn apm-btn-ok" onClick={() => void setStatus(record, "approved")}>Approve</button><button type="button" className="apm-btn apm-btn-danger" onClick={() => void setStatus(record, "declined")}>Decline</button></> : null}
              {moduleKey === "enquiries" && record.status !== "resolved" ? <button type="button" className="apm-btn" onClick={() => void setStatus(record, record.status === "new" ? "in-progress" : "resolved")}>{record.status === "new" ? "Start review" : "Resolve"}</button> : null}
              {moduleKey === "subscribers" && record.data?.list === "blog" && record.status === "active" ? <button type="button" className="apm-btn" onClick={() => void setStatus(record, "unsubscribed")}>Unsubscribe</button> : null}
              {moduleKey === "subscribers" && record.data?.list !== "blog" ? <button type="button" className="apm-btn" onClick={() => void setStatus(record, record.status === "active" ? "unsubscribed" : "active")}>{record.status === "active" ? "Unsubscribe" : "Reactivate"}</button> : null}
              {moduleKey === "blog" && record.status === "published" && !(text(record.data?.publishedAt) && Date.parse(text(record.data.publishedAt)) > Date.now()) ? <button type="button" className="apm-btn" disabled={sendingArticleId === record.id} onClick={() => void sendArticleEmail(record)}>{sendingArticleId === record.id ? "Sending…" : "Email Blog readers"}</button> : null}
              {(moduleKey === "blog" || moduleKey === "media") ? <button type="button" className="apm-btn apm-btn-danger" onClick={() => void removeRecord(record)}>Delete</button> : null}
            </div>
          </article>)}
        </div> : <div className="apm-card apm-empty">{loading ? "Loading records…" : moduleKey === "analytics" ? "No tracked events yet. Page-view events will appear as visitors browse the site." : moduleKey === "review-required" ? "Nothing is waiting for review right now. New Work With FK applications will appear here." : moduleKey === "media" ? "Your media library is empty. Upload a reusable image or PDF above." : moduleKey === "settings" ? "No saved settings yet. Use the settings button to create the first record." : "No records yet. Add the first record or refresh to check for new submissions."}</div>}
      </section>

      {editorOpen && editable ? <div role="dialog" aria-modal="true" aria-labelledby="cms-editor-heading" className="apm-modal">
        <form onSubmit={save} className="apm-editor">
          <div className="apm-editor-head">
            <div><p className="apm-eyebrow">CMS EDITOR</p><h2 id="cms-editor-heading">{editing ? "Edit record" : "Create new record"}</h2><p className="apm-muted">{meta.title}</p></div>
            <button type="button" className="apm-btn" onClick={() => setEditorOpen(false)}>Close</button>
          </div>
          <div className="apm-form-grid">
            <label><span className="apm-label">{moduleKey === "subscribers" ? "Record label" : "Title"}</span><input required className="apm-input" value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder={moduleKey === "subscribers" ? "Subscriber email" : "Title"} /></label>
            <label><span className="apm-label">Slug / URL key</span><input className="apm-input" value={draft.slug} onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value }))} placeholder="Generated from title if blank" readOnly={moduleKey === "settings"} /><small className="apm-help">Changing a published slug changes its public URL.</small></label>
            <label><span className="apm-label">Status</span><select className="apm-input" value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}>{(STATUS_OPTIONS[moduleKey] ?? [{ value: "draft", label: "Draft" }, { value: "active", label: "Active" }, { value: "archived", label: "Archived" }]).map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
          </div>
          <div className="apm-form-grid apm-form-fields">{fields.map(renderField)}</div>
          {moduleKey === "settings" ? <p className="apm-warn">These values are saved for operational reference. Payment and scheduling automation must not go live until the legal and commercial rules are approved.</p> : null}
          <div className="apm-editor-foot">
            <button type="button" className="apm-btn" onClick={() => setEditorOpen(false)}>Cancel</button>
            <button type="submit" className="apm-btn apm-btn-primary" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Create record"}</button>
          </div>
        </form>
      </div> : null}
    </div>
  );
}
