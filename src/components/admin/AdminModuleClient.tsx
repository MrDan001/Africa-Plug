// FILE PATH: src/components/admin/AdminModuleClient.tsx
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";

type ModuleKey = "blog" | "store" | "work-with-fk" | "review-required" | "enquiries" | "subscribers" | "analytics" | "media" | "settings" | "site-settings";
type CmsRecord = { id: string; module: string; title: string; slug: string | null; status: string; data: Record<string, unknown>; created_at: string; updated_at: string };
type Draft = { id?: string; title: string; slug: string; status: string; data: Record<string, unknown> };
type Field = { key: string; label: string; type?: "text" | "textarea" | "url" | "number" | "date" | "checkbox"; help?: string; rows?: number; placeholder?: string };

const DETAILS: Record<ModuleKey, { title: string; description: string; db: string }> = {
  blog: { title: "Blog & editorial", description: "Write articles, add imagery, manage categories and tags, and control SEO metadata. Publishing an article makes it eligible for the public journal.", db: "articles" },
  store: { title: "Store products", description: "Manage product descriptions, imagery, prices and catalogue status. Paid digital checkout is only available when a private download file is configured and Stripe is set up in production.", db: "products" },
  "work-with-fk": { title: "Work With FK", description: "Review incoming applications and keep every decision recorded in the admin inbox.", db: "applications" },
  "review-required": { title: "Review required", description: "Applications waiting for a decision. Approve or decline each one to keep the queue current.", db: "applications" },
  enquiries: { title: "Enquiries & forms", description: "Track Contact, Partner With TAP, Ask TAP and TAP IN expressions of interest in one persistent inbox.", db: "enquiries" },
  subscribers: { title: "Subscribers", description: "Manage the Stay Plugged In subscriber list and subscription status.", db: "subscribers" },
  analytics: { title: "Analytics & funnel", description: "Review page views, content views, form-related events and UTM/source information captured by the website.", db: "analytics" },
  media: { title: "Media library", description: "Upload reusable public images and PDFs and copy their asset URLs into articles and product records. Do not upload confidential or paid-download files here.", db: "media" },
  settings: { title: "Commercial settings", description: "Keep the current fees, meeting length, booking rules and draft commercial terms together. Payment automation should only be enabled after terms are approved.", db: "commercial-settings" },
  "site-settings": { title: "Site & SEO settings", description: "Store the site's title, description, contact/social destinations and feature switches in one place.", db: "site-settings" },
};

const FIELDS: Partial<Record<ModuleKey, Field[]>> = {
  blog: [
    { key: "category", label: "Category", type: "text" },
    { key: "excerpt", label: "Article excerpt", type: "textarea", rows: 3 },
    { key: "author", label: "Author / editorial desk", type: "text" },
    { key: "image", label: "Cover image URL", type: "url", help: "Upload an image in Media library and paste its public URL." },
    { key: "imageAlt", label: "Cover image alt text", type: "text" },
    { key: "publishedAt", label: "Publish date", type: "date" },
    { key: "readingTime", label: "Reading time", type: "text", placeholder: "5 min read" },
    { key: "tagsText", label: "Tags (comma separated)", type: "text" },
    { key: "takeaway", label: "TAP takeaway", type: "textarea", rows: 3 },
    { key: "body", label: "Article body", type: "textarea", rows: 12, help: "Separate paragraphs with a blank line. Use the site editor for simple editorial text; rich text and custom embeds are not enabled in this first CMS pass." },
    { key: "seoTitle", label: "SEO title", type: "text" },
    { key: "seoDescription", label: "SEO description", type: "textarea", rows: 3 },
    { key: "shareImage", label: "Share image URL (Open Graph)", type: "url" },
  ],
  store: [
    { key: "summary", label: "Short product summary", type: "textarea", rows: 3 },
    { key: "description", label: "Product description", type: "textarea", rows: 5 },
    { key: "price", label: "Price (numeric)", type: "number", help: "Enter the amount only. This catalogue value does not activate checkout by itself." },
    { key: "currency", label: "Currency code", type: "text", placeholder: "GBP" },
    { key: "imageUrl", label: "Product cover image URL", type: "url" },
    { key: "productType", label: "Product type", type: "text", placeholder: "Digital guide" },
    { key: "productFileReference", label: "Private download file path", type: "text", help: "Upload the file to the private Supabase Storage bucket named store-downloads, inside a folder matching this product slug. Enter its relative path, e.g. product-slug/guide.pdf. Never use a public URL." },
    { key: "seoTitle", label: "SEO title", type: "text" },
    { key: "seoDescription", label: "SEO description", type: "textarea", rows: 3 },
    { key: "featured", label: "Feature this product", type: "checkbox" },
  ],
  subscribers: [
    { key: "email", label: "Email address", type: "text" },
    { key: "name", label: "Name (optional)", type: "text" },
    { key: "source", label: "Signup source", type: "text" },
  ],
  settings: [
    { key: "consultationFee", label: "Meeting fee", type: "number" },
    { key: "depositAmount", label: "Deposit amount", type: "number" },
    { key: "currency", label: "Currency code", type: "text", placeholder: "GBP" },
    { key: "meetingMinutes", label: "Meeting length (minutes)", type: "number" },
    { key: "bookingUrl", label: "Scheduling URL", type: "url" },
    { key: "cancellationTerms", label: "Cancellation terms (draft)", type: "textarea", rows: 4 },
    { key: "rescheduleTerms", label: "Rescheduling terms (draft)", type: "textarea", rows: 4 },
    { key: "noShowTerms", label: "No-show / balance terms (draft)", type: "textarea", rows: 4 },
  ],
  "site-settings": [
    { key: "siteTitle", label: "Site title", type: "text" },
    { key: "navigationText", label: "Navigation links (one per line: label | /path)", type: "textarea", rows: 6, help: "Use internal paths only, e.g. TAP IN | /tap-in. Leave blank to use the standard navigation." },
    { key: "siteDescription", label: "Default SEO description", type: "textarea", rows: 3 },
    { key: "contactEmail", label: "Public contact email", type: "text" },
    { key: "whatsappUrl", label: "WhatsApp URL", type: "url" },
    { key: "linkedinUrl", label: "LinkedIn URL", type: "url" },
    { key: "instagramUrl", label: "Instagram URL", type: "url" },
    { key: "youtubeUrl", label: "YouTube URL", type: "url" },
    { key: "enableNewsletter", label: "Show newsletter signup", type: "checkbox" },
    { key: "enableSearch", label: "Enable site search", type: "checkbox" },
    { key: "enableSelectedWork", label: "Show selected work", type: "checkbox" },
    { key: "enableProductOfMonth", label: "Show Product of the Month on the Store page", type: "checkbox", help: "Needs the product name, TAP write-up and external link below. Leave off until you are ready to feature a product." },
    { key: "potmName", label: "Product of the Month: product name", type: "text" },
    { key: "potmPartner", label: "Product of the Month: partner / brand", type: "text" },
    { key: "potmMonthLabel", label: "Product of the Month: month label", type: "text", placeholder: "November 2026" },
    { key: "potmWriteUp", label: "Product of the Month: TAP write-up", type: "textarea", rows: 6, help: "Separate paragraphs with a blank line." },
    { key: "potmImageUrl", label: "Product of the Month: image URL", type: "url", help: "Upload in Media library and paste the public https:// URL." },
    { key: "potmUrl", label: "Product of the Month: external link (https://)", type: "url", help: "Your affiliate or partner link. Shown with the disclosure “TAP may earn a commission.”" },
    { key: "potmDiscountCode", label: "Product of the Month: discount code (optional)", type: "text" },
    { key: "potmDiscountNote", label: "Product of the Month: discount note (optional)", type: "text", placeholder: "10% off until 30 November" },
    { key: "tapInFilterThreshold", label: "Show TAP IN filters at this many live listings", type: "number", help: "Filters remain hidden below this count. Enter a whole number from 1 to 100." },
  ],
};

const STATUS_OPTIONS: Partial<Record<ModuleKey, { value: string; label: string }[]>> = {
  blog: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "archived", label: "Archived" }],
  store: [{ value: "draft", label: "Draft" }, { value: "active", label: "Visible in catalogue" }, { value: "archived", label: "Archived" }],
  subscribers: [{ value: "active", label: "Active" }, { value: "unsubscribed", label: "Unsubscribed" }],
  settings: [{ value: "active", label: "Current settings" }],
  "site-settings": [{ value: "active", label: "Current settings" }],
};

const INPUT_STYLE: React.CSSProperties = { width: "100%", padding: "12px 13px", border: "1px solid #d6d3cf", borderRadius: 4, background: "#fff", color: "#222", font: "inherit", boxSizing: "border-box" };
const LABEL_STYLE: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 700, color: "#404146", marginBottom: 7 };

function text(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return "";
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 160);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function toDraft(record?: CmsRecord, moduleKey?: ModuleKey): Draft {
  const source = record?.data ?? {};
  const data: Record<string, unknown> = { ...source };
  if (moduleKey === "blog") {
    data.tagsText = Array.isArray(source.tags) ? source.tags.map(String).join(", ") : "";
    data.body = Array.isArray(source.sections)
      ? source.sections.map((section) => {
          if (!section || typeof section !== "object") return "";
          const item = section as { heading?: unknown; paragraphs?: unknown };
          const paragraphs = Array.isArray(item.paragraphs) ? item.paragraphs.map(String).join("\n\n") : "";
          return [typeof item.heading === "string" ? item.heading : "", paragraphs].filter(Boolean).join("\n\n");
        }).join("\n\n")
      : text(source.body);
    const publishedAt = text(source.publishedAt);
    data.publishedAt = /^\d{4}-\d{2}-\d{2}$/.test(publishedAt) ? publishedAt : publishedAt ? (Number.isNaN(Date.parse(publishedAt)) ? today() : new Date(publishedAt).toISOString().slice(0, 10)) : today();
  }
  if (moduleKey === "subscribers") data.email = text(source.email) || record?.title || "";
  if (moduleKey === "site-settings") {
    data.navigationText = Array.isArray(source.navigation)
      ? source.navigation.map((item) => item && typeof item === "object" ? `${text((item as Record<string, unknown>).label)} | ${text((item as Record<string, unknown>).href)}` : "").filter(Boolean).join("\n")
      : text(source.navigationText);
  }
  return {
    ...(record?.id ? { id: record.id } : {}),
    title: record?.title ?? "",
    slug: record?.slug ?? "",
    status: record?.status ?? (moduleKey === "blog" || moduleKey === "store" ? "draft" : "active"),
    data,
  };
}

function makeData(moduleKey: ModuleKey, draft: Draft) {
  const data: Record<string, unknown> = { ...draft.data };
  if (moduleKey === "blog") {
    const tagsText = text(data.tagsText);
    const body = text(data.body);
    data.tags = tagsText.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 30);
    data.sections = body.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean).map((paragraph) => ({ heading: "", paragraphs: [paragraph] }));
    delete data.tagsText;
    delete data.body;
  }
  if (moduleKey === "store") {
    const price = Number(data.price ?? 0);
    data.price = Number.isFinite(price) && price >= 0 ? price : 0;
  }
  if (moduleKey === "site-settings") {
    const navigation = text(data.navigationText).split("\n").map((line) => {
      const [label, href] = line.split("|").map((part) => part.trim());
      return { label: (label ?? "").slice(0, 40), href: href ?? "" };
    }).filter((item) => item.label && item.href.startsWith("/") && !item.href.startsWith("//") && !item.href.startsWith("/admin") && !item.href.startsWith("/api")).slice(0, 12);
    data.navigation = navigation;
    delete data.navigationText;
  }
  if (moduleKey === "subscribers") {
    data.email = text(data.email).trim().toLowerCase();
    data.name = text(data.name).trim();
    data.source = text(data.source) || "Admin";
  }
  return data;
}

export default function AdminModuleClient({ moduleKey }: { moduleKey: ModuleKey }) {
  const meta = DETAILS[moduleKey];
  const fields = FIELDS[moduleKey] ?? [];
  const editable = Boolean(FIELDS[moduleKey]);
  const [records, setRecords] = useState<CmsRecord[]>([]);
  const [draft, setDraft] = useState<Draft>(() => toDraft(undefined, moduleKey));
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ status: statusFilter, ...(search.trim() ? { search: search.trim() } : {}) });
      const response = await fetch(`/api/admin/cms/${moduleKey}?${query.toString()}`, { cache: "no-store" });
      const data = await response.json() as { records?: CmsRecord[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Could not load this module.");
      setRecords(Array.isArray(data.records) ? data.records : []);
      setNotice((current) => current?.tone === "error" ? null : current);
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Could not load this module." });
    } finally { setLoading(false); }
  }, [moduleKey, search, statusFilter]);

  // Fetch-on-mount: loadRecords updates loading state before the request starts.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { document.title = `${meta.title} | Africa Plug Admin`; void loadRecords(); }, [loadRecords, meta.title]);

  const stats = useMemo(() => ({
    total: records.length,
    waiting: records.filter((record) => ["review-required", "pending", "submitted", "new"].includes(record.status)).length,
    published: records.filter((record) => ["published", "active", "approved"].includes(record.status)).length,
  }), [records]);

  function updateField(key: string, value: unknown) {
    setDraft((current) => ({ ...current, data: { ...current.data, [key]: value } }));
  }

  function newRecord() {
    const next = toDraft(undefined, moduleKey);
    if (moduleKey === "blog") next.data = { category: "Business", author: "The TAP Journal Editorial Desk", publishedAt: today(), readingTime: "5 min read", tagsText: "", body: "", excerpt: "", image: "", imageAlt: "", takeaway: "", seoTitle: "", seoDescription: "", shareImage: "" };
    if (moduleKey === "store") next.data = { summary: "", description: "", price: 0, currency: "GBP", imageUrl: "", productType: "Digital resource", productFileReference: "", seoTitle: "", seoDescription: "", featured: false };
    if (moduleKey === "subscribers") next.data = { email: "", name: "", source: "Admin" };
    if (moduleKey === "settings") { next.title = "Commercial settings"; next.slug = "commercial-settings"; next.data = { consultationFee: "", depositAmount: "", currency: "GBP", meetingMinutes: 60, bookingUrl: "", cancellationTerms: "", rescheduleTerms: "", noShowTerms: "" }; }
    if (moduleKey === "site-settings") { next.title = "Site settings"; next.slug = "site-settings"; next.data = { siteTitle: "The Africa Plug", siteDescription: "", contactEmail: "", whatsappUrl: "", linkedinUrl: "", instagramUrl: "", youtubeUrl: "", navigationText: ["TAP IN | /tap-in", "WORK WITH FK | /work-with-fk", "STORE | /store", "BLOG | /blog", "CONTACT | /contact", "ABOUT | /about"].join("\n"), enableNewsletter: false, enableSearch: true, enableSelectedWork: true, enableProductOfMonth: false, tapInFilterThreshold: 6 }; }
    setDraft(next);
    setEditing(false);
    setEditorOpen(true);
    setNotice(null);
  }

  function editRecord(record: CmsRecord) {
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
      setNotice({ tone: "success", text: editing ? "Changes saved." : "Record created and saved." });
      setEditorOpen(false);
      setEditing(false);
      await loadRecords();
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Could not save changes." });
    } finally { setSaving(false); }
  }

  async function setStatus(record: CmsRecord, status: string) {
    const actionLabel = status === "approved" ? "approve" : status === "declined" ? "decline" : status === "resolved" ? "resolve" : status === "unsubscribed" ? "unsubscribe" : "update";
    if ((status === "declined" || status === "archived") && !window.confirm(`Are you sure you want to ${actionLabel} “${record.title}”?`)) return;
    setNotice(null);
    try {
      const isApplicationDecision = (moduleKey === "work-with-fk" || moduleKey === "review-required") && (status === "approved" || status === "declined");
      const response = await fetch(isApplicationDecision ? "/api/work-with-fk/approve" : `/api/admin/cms/${moduleKey}`, {
        method: "PATCH" === "PATCH" && isApplicationDecision ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isApplicationDecision ? { id: record.id, decision: status } : { id: record.id, status }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not update status.");
      setNotice({ tone: "success", text: `Status updated to ${status.replace(/-/g, " ")}.` });
      await loadRecords();
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Could not update status." });
    }
  }

  async function schedulerAction(record: CmsRecord, action: "confirm-payment" | "send-link") {
    if (action === "confirm-payment" && !window.confirm(`Confirm that the deposit or invoice payment for “${record.title}” has been received?`)) return;
    if (action === "send-link" && record.data?.schedulerIssuedAt && !window.confirm("A scheduler link was already sent. Sending again deactivates the old link. Continue?")) return;
    setNotice(null);
    try {
      const response = await fetch("/api/work-with-fk/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: record.id, action }),
      });
      const data = await response.json() as { error?: string; message?: string; link?: string; emailNotification?: string };
      if (!response.ok) throw new Error(data.error || "Could not update the scheduler.");
      if (data.link && data.emailNotification !== "sent") window.prompt("The email was not sent automatically. Copy this private link and send it to the applicant:", data.link);
      setNotice({ tone: "success", text: data.message || "Scheduler updated." });
      await loadRecords();
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Could not update the scheduler." });
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
  function recordSummary(record: CmsRecord) {
    const data = record.data ?? {};
    const fields = [data.email, data.organisation, data.organization, data.opportunityName, data.category, data.excerpt, data.summary, data.path, data.eventName];
    return fields.map(text).filter(Boolean).join(" · ");
  }

  return (
    <main className="ap-admin" style={{ minHeight: "100vh", paddingBottom: 48 }}>
      <header className="ap-admin-topbar">
        <Link className="ap-admin-brand" href="/admin"><span>AP</span><b>THE AFRICA PLUG</b></Link>
        <div className="ap-admin-top-actions"><Link href="/">View website ↗</Link><Link href="/admin">Control room ↗</Link></div>
      </header>

      <section className="ap-admin-hero" style={{ paddingBottom: 30 }}>
        <p className="ap-admin-eyebrow">THE AFRICA PLUG · CMS</p>
        <h1>{meta.title}<br /><em>control.</em></h1>
        <p className="ap-admin-lede">{meta.description}</p>
        <div className="ap-admin-shortcuts"><Link href="/admin">← All modules</Link>{moduleKey === "review-required" ? <Link href="/admin/work-with-fk">All applications ↗</Link> : null}{moduleKey === "blog" ? <Link href="/blog" target="_blank" rel="noreferrer">View journal ↗</Link> : null}{moduleKey === "store" ? <Link href="/store" target="_blank" rel="noreferrer">View store ↗</Link> : null}</div>
      </section>

      <section style={{ padding: "0 clamp(16px, 4vw, 48px) 26px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, maxWidth: 900 }}>
          <div className="ap-admin-card" style={{ minHeight: 80 }}><small>RECORDS IN VIEW</small><h2>{stats.total}</h2></div>
          <div className="ap-admin-card" style={{ minHeight: 80 }}><small>NEED ATTENTION</small><h2>{stats.waiting}</h2></div>
          <div className="ap-admin-card" style={{ minHeight: 80 }}><small>LIVE / ACTIVE</small><h2>{stats.published}</h2></div>
        </div>
      </section>

      {notice ? <p role="status" style={{ margin: "0 clamp(16px, 4vw, 48px) 18px", padding: "14px 16px", border: `1px solid ${notice.tone === "error" ? "#b33a42" : "#2c8063"}`, background: notice.tone === "error" ? "#fff1f1" : "#effaf5", color: notice.tone === "error" ? "#8d2028" : "#176447" }}>{notice.text}</p> : null}

      <section style={{ padding: "0 clamp(16px, 4vw, 48px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
          <div><h2 style={{ fontSize: 24, margin: 0 }}>Records</h2><p style={{ margin: "6px 0 0", color: "#696a70" }}>{loading ? "Loading…" : `${records.length} record${records.length === 1 ? "" : "s"}`}</p></div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "end" }}>
            <label style={{ fontSize: 12, fontWeight: 700 }}>Search<input style={{ ...INPUT_STYLE, minWidth: 180, marginTop: 6 }} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records…" /></label>
            {STATUS_OPTIONS[moduleKey] ? <label style={{ fontSize: 12, fontWeight: 700 }}>Status<select style={{ ...INPUT_STYLE, marginTop: 6 }} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option>{STATUS_OPTIONS[moduleKey]!.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label> : null}
            <button type="button" onClick={() => void loadRecords()} style={{ padding: "12px 14px", border: "1px solid #c9c7c2", background: "#fff", cursor: "pointer" }}>Refresh</button>
            {editable && moduleKey !== "settings" && moduleKey !== "site-settings" ? <button type="button" className="ap-admin-shortcuts" onClick={newRecord} style={{ padding: "12px 14px", cursor: "pointer", background: "#d51f6d", color: "#fff", border: 0 }}>+ Add {moduleKey === "blog" ? "article" : moduleKey === "store" ? "product" : "subscriber"}</button> : null}
            {moduleKey === "settings" || moduleKey === "site-settings" ? <button type="button" onClick={editSettings} style={{ padding: "12px 14px", cursor: "pointer", background: "#d51f6d", color: "#fff", border: 0 }}>{records.length ? "Edit settings" : "Set up settings"}</button> : null}
          </div>
        </div>

        {moduleKey === "media" ? <section className="ap-admin-card" style={{ marginBottom: 18 }}>
          <h3 style={{ marginTop: 0 }}>Upload a reusable asset</h3>
          <p style={{ color: "#696a70", lineHeight: 1.6 }}>Images and PDFs up to 20 MB. Uploaded library assets are public URLs for use on the website.</p>
          <label style={{ display: "inline-block", cursor: "pointer", padding: "12px 16px", background: "#d51f6d", color: "white", fontWeight: 700 }}>
            {uploading ? "Uploading…" : "Choose and upload file"}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,application/pdf" disabled={uploading} onChange={(event) => void uploadAsset(event)} style={{ display: "none" }} />
          </label>
        </section> : null}

        {moduleKey === "analytics" && records.length ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10, marginBottom: 18 }}>
          {["page_view", "article_view", "product_view", "form_submit"].map((eventName) => <div key={eventName} className="ap-admin-card"><small>{eventName.replace(/_/g, " ").toUpperCase()}</small><h2>{records.filter((r) => r.data?.eventName === eventName).length}</h2></div>)}
        </div> : null}

        {records.length ? <div style={{ display: "grid", gap: 10 }}>
          {records.map((record) => <article key={record.id} className="ap-admin-card" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 18, alignItems: "start" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 800, padding: "5px 7px", background: "#f0e8eb", color: "#8f174e" }}>{record.status.replace(/-/g, " ")}</span>
                <small style={{ color: "#777" }}>{new Date(record.updated_at).toLocaleString("en-GB")}</small>
              </div>
              <h3 style={{ margin: "10px 0 6px", fontSize: 19, overflowWrap: "anywhere" }}>{record.title || "Untitled record"}</h3>
              {recordSummary(record) ? <p style={{ margin: "0 0 8px", color: "#5e6066", lineHeight: 1.5, overflowWrap: "anywhere" }}>{recordSummary(record)}</p> : null}
              {(moduleKey === "work-with-fk" || moduleKey === "review-required") && record.status === "approved" ? <p style={{ margin: "0 0 8px", color: "#5e6066", fontSize: 13 }}>Scheduler: {record.data?.meetingBookedAt ? "meeting booked" : record.data?.schedulerIssuedAt ? "private link sent" : record.data?.paymentStatus === "confirmed" ? "payment confirmed, link not sent yet" : "waiting for payment confirmation"}</p> : null}
              {moduleKey === "blog" || moduleKey === "store" ? <small style={{ color: "#777" }}>URL: /{moduleKey === "blog" ? "blog" : "store"}/{record.slug}</small> : null}
              {moduleKey === "store" ? <small style={{ display: "block", marginTop: 7, color: record.data?.productFileReference ? "#176447" : "#8a5b12" }}>{record.data?.productFileReference ? "Protected file uploaded" : "No protected file uploaded yet"}</small> : null}
              {moduleKey === "media" && typeof record.data?.url === "string" ? <a href={record.data.url} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 6, color: "#a91b58", overflowWrap: "anywhere" }}>Open asset ↗</a> : null}
              {(moduleKey === "enquiries" || moduleKey === "work-with-fk" || moduleKey === "review-required") ? <details style={{ marginTop: 10 }}><summary style={{ cursor: "pointer", fontWeight: 700 }}>Read submission details</summary><dl style={{ display: "grid", gridTemplateColumns: "minmax(85px,130px) minmax(0,1fr)", gap: "6px 12px", fontSize: 13, marginTop: 12 }}>{Object.entries(record.data ?? {}).filter(([key, value]) => value !== null && value !== "" && !["turnstileToken", "website"].includes(key) && typeof value !== "object").map(([key, value]) => <div key={key} style={{ display: "contents" }}><dt style={{ color: "#777", overflowWrap: "anywhere" }}>{key.replace(/([A-Z])/g, " $1")}</dt><dd style={{ margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{String(value)}</dd></div>)}</dl></details> : null}
              {moduleKey === "analytics" ? <details style={{ marginTop: 8 }}><summary style={{ cursor: "pointer" }}>View source and UTM details</summary><pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontSize: 12, padding: 10, background: "#f7f7f5" }}>{JSON.stringify(record.data, null, 2)}</pre></details> : null}
              {moduleKey === "subscribers" ? <p style={{ margin: "6px 0 0", color: "#777", fontSize: 12 }}>{text(record.data?.source) || "Source not recorded"}</p> : null}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "end", maxWidth: 260 }}>
              {editable ? <button type="button" onClick={() => editRecord(record)} style={{ padding: "9px 12px", cursor: "pointer", border: "1px solid #c9c7c2", background: "white" }}>Edit</button> : null}
              {moduleKey === "store" ? <label style={{ padding: "9px 12px", cursor: uploading ? "wait" : "pointer", border: "1px solid #a91b58", background: "#fff", color: "#a91b58", fontWeight: 700, fontSize: 12, opacity: uploading ? 0.65 : 1 }}>{uploading ? "UPLOADING…" : "UPLOAD PROTECTED FILE"}<input type="file" accept=".pdf,.epub,.zip,application/pdf,application/epub+zip,application/zip" disabled={uploading} onChange={(event) => void uploadStoreProductFile(event, record)} style={{ display: "none" }} /></label> : null}
              {(moduleKey === "work-with-fk" || moduleKey === "review-required") && ["review-required", "pending", "submitted", "new"].includes(record.status) ? <><button type="button" onClick={() => void setStatus(record, "approved")} style={{ padding: "9px 12px", cursor: "pointer", border: 0, background: "#1f7658", color: "white" }}>Approve</button><button type="button" onClick={() => void setStatus(record, "declined")} style={{ padding: "9px 12px", cursor: "pointer", border: "1px solid #b33a42", background: "white", color: "#9f2933" }}>Decline</button></> : null}
              {(moduleKey === "work-with-fk" || moduleKey === "review-required") && record.status === "approved" ? <>{record.data?.paymentStatus !== "confirmed" ? <button type="button" onClick={() => void schedulerAction(record, "confirm-payment")} style={{ padding: "9px 12px", cursor: "pointer", border: "1px solid #c9c7c2", background: "white" }}>Confirm payment received</button> : null}{record.data?.paymentStatus === "confirmed" && !record.data?.meetingBookedAt ? <button type="button" onClick={() => void schedulerAction(record, "send-link")} style={{ padding: "9px 12px", cursor: "pointer", border: 0, background: "#1f7658", color: "white" }}>{record.data?.schedulerIssuedAt ? "Resend scheduler link" : "Send scheduler link"}</button> : null}</> : null}
              {moduleKey === "enquiries" && record.status !== "resolved" ? <button type="button" onClick={() => void setStatus(record, record.status === "new" ? "in-progress" : "resolved")} style={{ padding: "9px 12px", cursor: "pointer", border: "1px solid #c9c7c2", background: "white" }}>{record.status === "new" ? "Start review" : "Resolve"}</button> : null}
              {moduleKey === "subscribers" ? <button type="button" onClick={() => void setStatus(record, record.status === "active" ? "unsubscribed" : "active")} style={{ padding: "9px 12px", cursor: "pointer", border: "1px solid #c9c7c2", background: "white" }}>{record.status === "active" ? "Unsubscribe" : "Reactivate"}</button> : null}
              {(moduleKey === "blog" || moduleKey === "store" || moduleKey === "media") ? <button type="button" onClick={() => void removeRecord(record)} style={{ padding: "9px 12px", cursor: "pointer", border: "1px solid #b33a42", color: "#9f2933", background: "white" }}>Delete</button> : null}
            </div>
          </article>)}
        </div> : <div className="ap-admin-card" style={{ padding: "28px 20px", color: "#68696e" }}>{loading ? "Loading records…" : moduleKey === "analytics" ? "No tracked events yet. Page-view events will appear as visitors browse the site." : moduleKey === "review-required" ? "Nothing is waiting for review right now. New Work With FK applications will appear here." : moduleKey === "media" ? "Your media library is empty. Upload a reusable image or PDF above." : moduleKey === "settings" || moduleKey === "site-settings" ? "No saved settings yet. Use the settings button to create the first record." : "No records yet. Add the first record or refresh to check for new submissions."}</div>}
      </section>

      {editorOpen && editable ? <div role="dialog" aria-modal="true" aria-labelledby="cms-editor-heading" style={{ position: "fixed", inset: 0, zIndex: 1200, background: "rgba(10,11,14,.68)", overflowY: "auto", padding: "24px 14px" }}>
        <form onSubmit={save} style={{ width: "min(100%, 900px)", margin: "0 auto", padding: "clamp(18px,4vw,36px)", background: "#f8f7f4", color: "#202126", borderRadius: 5, boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 12, marginBottom: 24 }}>
            <div><p className="ap-admin-eyebrow">CMS EDITOR</p><h2 id="cms-editor-heading" style={{ fontSize: 28, margin: "0 0 8px" }}>{editing ? "Edit record" : "Create new record"}</h2><p style={{ color: "#666" }}>{meta.title}</p></div>
            <button type="button" onClick={() => setEditorOpen(false)} style={{ padding: "10px 12px", cursor: "pointer", border: "1px solid #c9c7c2", background: "white" }}>Close</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
            <label><span style={LABEL_STYLE}>{moduleKey === "subscribers" ? "Record label" : "Title"}</span><input required style={INPUT_STYLE} value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder={moduleKey === "subscribers" ? "Subscriber email" : "Title"} /></label>
            <label><span style={LABEL_STYLE}>Slug / URL key</span><input style={INPUT_STYLE} value={draft.slug} onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value }))} placeholder="Generated from title if blank" readOnly={moduleKey === "settings" || moduleKey === "site-settings"} /><small style={{ display: "block", color: "#777", marginTop: 5 }}>Changing a published slug changes its public URL.</small></label>
            <label><span style={LABEL_STYLE}>Status</span><select style={INPUT_STYLE} value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}>{(STATUS_OPTIONS[moduleKey] ?? [{ value: "draft", label: "Draft" }, { value: "active", label: "Active" }, { value: "archived", label: "Archived" }]).map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14, marginTop: 18 }}>
            {fields.map((field) => <label key={field.key} style={field.type === "textarea" ? { gridColumn: "1 / -1" } : undefined}>
              <span style={LABEL_STYLE}>{field.label}</span>
              {field.type === "textarea" ? <textarea rows={field.rows ?? 3} style={{ ...INPUT_STYLE, resize: "vertical" }} value={text(draft.data[field.key])} onChange={(event) => updateField(field.key, event.target.value)} placeholder={field.placeholder} /> : field.type === "checkbox" ? <span style={{ display: "flex", alignItems: "center", gap: 10 }}><input type="checkbox" checked={Boolean(draft.data[field.key])} onChange={(event) => updateField(field.key, event.target.checked)} /><span>{field.label}</span></span> : <input style={INPUT_STYLE} type={field.type === "number" || field.type === "date" || field.type === "url" ? field.type : "text"} value={text(draft.data[field.key])} onChange={(event) => updateField(field.key, field.type === "number" ? event.target.value : event.target.value)} placeholder={field.placeholder} required={field.key === "email" || field.key === "excerpt" || (moduleKey === "blog" && field.key === "category")} />}
              {field.help ? <small style={{ display: "block", color: "#777", marginTop: 5, lineHeight: 1.4 }}>{field.help}</small> : null}
            </label>)}
          </div>
          {moduleKey === "store" ? <p style={{ color: "#7a4e10", background: "#fff7e8", padding: 12, lineHeight: 1.5 }}>Before charging for a digital product, upload its file to the private store-downloads bucket and enter the exact path above. Checkout verifies the product file is available first. Stripe live keys and the production webhook secret must also be configured in Vercel.</p> : null}
          {moduleKey === "settings" ? <p style={{ color: "#7a4e10", background: "#fff7e8", padding: 12, lineHeight: 1.5 }}>These values are saved for operational reference. Payment and scheduling automation must not go live until the legal and commercial rules are approved.</p> : null}
          <div style={{ display: "flex", gap: 10, justifyContent: "end", flexWrap: "wrap", marginTop: 28 }}>
            <button type="button" onClick={() => setEditorOpen(false)} style={{ padding: "13px 16px", cursor: "pointer", border: "1px solid #c9c7c2", background: "white" }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding: "13px 18px", cursor: saving ? "wait" : "pointer", border: 0, background: "#d51f6d", color: "white", fontWeight: 800 }}>{saving ? "Saving…" : editing ? "Save changes" : "Create record"}</button>
          </div>
        </form>
      </div> : null}

      <footer className="ap-admin-footer"><span>THE AFRICA PLUG · ADMIN</span><Link href="/admin">Back to control room ↗</Link><span>Save, review, publish.</span></footer>
    </main>
  );
}