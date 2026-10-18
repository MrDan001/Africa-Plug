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
  "site-settings": { title: "Site & SEO Settings", description: "Site identity, navigation, search-engine details, store features and switches in one place.", db: "site-settings" },
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
    { key: "productFileReference", label: "Private download file path", type: "text", help: "Use Upload Protected File on the saved product row below. Files are stored privately. Never paste a public download URL here." },
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

/** Which Site & SEO fields appear on which tab. */
const SETTINGS_TABS: { id: string; label: string; blurb: string; keys: string[] }[] = [
  { id: "info", label: "Site information", blurb: "Your brand name and public contact and social links.", keys: ["siteTitle", "contactEmail", "whatsappUrl", "linkedinUrl", "instagramUrl", "youtubeUrl"] },
  { id: "navigation", label: "Navigation", blurb: "The links shown in the main site menu.", keys: ["navigationText"] },
  { id: "seo", label: "SEO", blurb: "What search engines and link previews show by default.", keys: ["siteDescription"] },
  { id: "store", label: "Store & Product of the Month", blurb: "Feature one partner product on the Store page.", keys: ["enableProductOfMonth", "potmName", "potmPartner", "potmMonthLabel", "potmWriteUp", "potmImageUrl", "potmUrl", "potmDiscountCode", "potmDiscountNote"] },
  { id: "switches", label: "Features & switches", blurb: "Turn site features on or off.", keys: ["enableNewsletter", "enableSearch", "enableSelectedWork", "tapInFilterThreshold"] },
];

const STATUS_OPTIONS: Partial<Record<ModuleKey, { value: string; label: string }[]>> = {
  blog: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "archived", label: "Archived" }],
  store: [{ value: "draft", label: "Draft" }, { value: "active", label: "Visible in catalogue" }, { value: "archived", label: "Archived" }],
  subscribers: [{ value: "active", label: "Active" }, { value: "unsubscribed", label: "Unsubscribed" }],
  settings: [{ value: "active", label: "Current settings" }],
  "site-settings": [{ value: "active", label: "Current settings" }],
};

function text(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return "";
}

function tone(status: string) {
  if (["published", "active", "approved", "resolved", "recorded"].includes(status)) return "ok";
  if (["declined", "unsubscribed", "archived"].includes(status)) return "bad";
  if (["review-required", "pending", "submitted", "new", "draft", "in-progress"].includes(status)) return "warn";
  return "neutral";
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 160);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function defaultSiteSettings(): Draft {
  return {
    title: "Site settings",
    slug: "site-settings",
    status: "active",
    data: { siteTitle: "The Africa Plug", siteDescription: "", contactEmail: "", whatsappUrl: "", linkedinUrl: "", instagramUrl: "", youtubeUrl: "", navigationText: ["TAP IN | /tap-in", "WORK WITH FK | /work-with-fk", "STORE | /store", "BLOG | /blog", "CONTACT | /contact", "ABOUT | /about"].join("\n"), enableNewsletter: false, enableSearch: true, enableSelectedWork: true, enableProductOfMonth: false, tapInFilterThreshold: 6 },
  };
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
  const [draft, setDraft] = useState<Draft>(() => moduleKey === "site-settings" ? defaultSiteSettings() : toDraft(undefined, moduleKey));
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState(SETTINGS_TABS[0].id);
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

  const stats = useMemo(() => ({
    total: records.length,
    waiting: records.filter((record) => ["review-required", "pending", "submitted", "new"].includes(record.status)).length,
    published: records.filter((record) => ["published", "active", "approved"].includes(record.status)).length,
  }), [records]);

  function updateField(key: string, value: unknown) {
    setDirty(true);
    setDraft((current) => ({ ...current, data: { ...current.data, [key]: value } }));
  }

  function newRecord() {
    const next = toDraft(undefined, moduleKey);
    if (moduleKey === "blog") next.data = { category: "Business", author: "The TAP Journal Editorial Desk", publishedAt: today(), readingTime: "5 min read", tagsText: "", body: "", excerpt: "", image: "", imageAlt: "", takeaway: "", seoTitle: "", seoDescription: "", shareImage: "" };
    if (moduleKey === "store") next.data = { summary: "", description: "", price: 0, currency: "GBP", imageUrl: "", productType: "Digital resource", productFileReference: "", seoTitle: "", seoDescription: "", featured: false };
    if (moduleKey === "subscribers") next.data = { email: "", name: "", source: "Admin" };
    if (moduleKey === "settings") { next.title = "Commercial settings"; next.slug = "commercial-settings"; next.data = { consultationFee: "", depositAmount: "", currency: "GBP", meetingMinutes: 60, bookingUrl: "", cancellationTerms: "", rescheduleTerms: "", noShowTerms: "" }; }
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
      setNotice({ tone: "success", text: moduleKey === "site-settings" ? "Settings saved. The site will use them on the next page load." : editing ? "Changes saved." : "Record created and saved." });
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
        method: isApplicationDecision ? "POST" : "PATCH",
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

  /** One form control, used by both the modal editor and the inline Site & SEO form. */
  function renderField(field: Field) {
    const value = draft.data[field.key];
    return (
      <label key={field.key} className={field.type === "textarea" ? "is-wide" : undefined}>
        {field.type === "checkbox" ? (
          <span className="apm-check"><input type="checkbox" checked={Boolean(value)} onChange={(event) => updateField(field.key, event.target.checked)} /><span>{field.label}</span></span>
        ) : (
          <>
            <span className="apm-label">{field.label}</span>
            {field.type === "textarea"
              ? <textarea rows={field.rows ?? 3} className="apm-input apm-textarea" value={text(value)} onChange={(event) => updateField(field.key, event.target.value)} placeholder={field.placeholder} />
              : <input className="apm-input" type={field.type === "number" || field.type === "date" || field.type === "url" ? field.type : "text"} value={text(value)} onChange={(event) => updateField(field.key, event.target.value)} placeholder={field.placeholder} required={field.key === "email" || field.key === "excerpt" || (moduleKey === "blog" && field.key === "category")} />}
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
    const profileKeys = ["siteTitle", "siteDescription", "contactEmail", "whatsappUrl", "linkedinUrl"];
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
      { ok: /^https:\/\//i.test(text(data.whatsappUrl).trim()), label: "WhatsApp link is set (https://)" },
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
          </div> : <p className="apm-count">{loading ? "Loading…" : `${records.length} record${records.length === 1 ? "" : "s"}`}</p>}
          <input className="apm-input apm-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records…" aria-label="Search records" />
          <button type="button" className="apm-btn" onClick={() => void loadRecords()}>Refresh</button>
        </div>

        {moduleKey === "media" ? <section className="apm-card apm-upload">
          <h3>Upload a reusable asset</h3>
          <p className="apm-muted">Images and PDFs up to 20 MB. Uploaded library assets are public URLs for use on the website.</p>
          <label className="apm-btn apm-btn-primary">
            {uploading ? "Uploading…" : "Choose and upload file"}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,application/pdf" disabled={uploading} onChange={(event) => void uploadAsset(event)} style={{ display: "none" }} />
          </label>
        </section> : null}

        {moduleKey === "analytics" && records.length ? <div className="apm-stats">
          {["page_view", "article_view", "product_view", "form_submit"].map((eventName) => <div key={eventName} className="apm-stat"><small>{eventName.replace(/_/g, " ")}</small><strong>{records.filter((r) => r.data?.eventName === eventName).length}</strong></div>)}
        </div> : null}

        {records.length ? <div className="apm-card apm-list">
          {records.map((record) => <article key={record.id} className="apm-row">
            <div className="apm-row-main">
              <div className="apm-row-meta">
                <span className={`apm-tag is-${tone(record.status)}`}>{record.status.replace(/-/g, " ")}</span>
                <small>{new Date(record.updated_at).toLocaleString("en-GB")}</small>
              </div>
              <h3>{record.title || "Untitled record"}</h3>
              {recordSummary(record) ? <p className="apm-summary">{recordSummary(record)}</p> : null}
              {(moduleKey === "work-with-fk" || moduleKey === "review-required") && record.status === "approved" ? <p className="apm-scheduler">Scheduler: {record.data?.meetingBookedAt ? "meeting booked" : record.data?.schedulerIssuedAt ? "private link sent" : record.data?.paymentStatus === "confirmed" ? "payment confirmed, link not sent yet" : "waiting for payment confirmation"}</p> : null}
              {moduleKey === "blog" || moduleKey === "store" ? <small className="apm-url">URL: /{moduleKey === "blog" ? "blog" : "store"}/{record.slug}</small> : null}
              {moduleKey === "store" ? <small className={`apm-file ${record.data?.productFileReference ? "is-ok" : "is-warn"}`}>{record.data?.productFileReference ? "Protected file uploaded" : "No protected file uploaded yet"}</small> : null}
              {moduleKey === "media" && typeof record.data?.url === "string" ? <a className="apm-link" href={record.data.url} target="_blank" rel="noreferrer">Open asset ↗</a> : null}
              {(moduleKey === "enquiries" || moduleKey === "work-with-fk" || moduleKey === "review-required") ? <details className="apm-details"><summary>Read submission details</summary><dl>{Object.entries(record.data ?? {}).filter(([key, value]) => value !== null && value !== "" && !["turnstileToken", "website"].includes(key) && typeof value !== "object").map(([key, value]) => <div key={key} className="apm-dl-row"><dt>{key.replace(/([A-Z])/g, " $1")}</dt><dd>{String(value)}</dd></div>)}</dl></details> : null}
              {moduleKey === "analytics" ? <details className="apm-details"><summary>View source and UTM details</summary><pre className="apm-pre">{JSON.stringify(record.data, null, 2)}</pre></details> : null}
              {moduleKey === "subscribers" ? <p className="apm-url">{text(record.data?.source) || "Source not recorded"}</p> : null}
            </div>
            <div className="apm-actions">
              {editable ? <button type="button" className="apm-btn" onClick={() => editRecord(record)}>Edit</button> : null}
              {moduleKey === "store" ? <label className={`apm-btn apm-btn-file${uploading ? " is-busy" : ""}`}>{uploading ? "Uploading…" : "Upload protected file"}<input type="file" accept=".pdf,.epub,.zip,application/pdf,application/epub+zip,application/zip" disabled={uploading} onChange={(event) => void uploadStoreProductFile(event, record)} style={{ display: "none" }} /></label> : null}
              {(moduleKey === "work-with-fk" || moduleKey === "review-required") && ["review-required", "pending", "submitted", "new"].includes(record.status) ? <><button type="button" className="apm-btn apm-btn-ok" onClick={() => void setStatus(record, "approved")}>Approve</button><button type="button" className="apm-btn apm-btn-danger" onClick={() => void setStatus(record, "declined")}>Decline</button></> : null}
              {(moduleKey === "work-with-fk" || moduleKey === "review-required") && record.status === "approved" ? <>{record.data?.paymentStatus !== "confirmed" ? <button type="button" className="apm-btn" onClick={() => void schedulerAction(record, "confirm-payment")}>Confirm payment received</button> : null}{record.data?.paymentStatus === "confirmed" && !record.data?.meetingBookedAt ? <button type="button" className="apm-btn apm-btn-ok" onClick={() => void schedulerAction(record, "send-link")}>{record.data?.schedulerIssuedAt ? "Resend scheduler link" : "Send scheduler link"}</button> : null}</> : null}
              {moduleKey === "enquiries" && record.status !== "resolved" ? <button type="button" className="apm-btn" onClick={() => void setStatus(record, record.status === "new" ? "in-progress" : "resolved")}>{record.status === "new" ? "Start review" : "Resolve"}</button> : null}
              {moduleKey === "subscribers" ? <button type="button" className="apm-btn" onClick={() => void setStatus(record, record.status === "active" ? "unsubscribed" : "active")}>{record.status === "active" ? "Unsubscribe" : "Reactivate"}</button> : null}
              {(moduleKey === "blog" || moduleKey === "store" || moduleKey === "media") ? <button type="button" className="apm-btn apm-btn-danger" onClick={() => void removeRecord(record)}>Delete</button> : null}
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
          {moduleKey === "store" ? <p className="apm-warn">Publishing a product updates the catalogue. Paid checkout works only when a protected file is uploaded and Stripe is configured in production.</p> : null}
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