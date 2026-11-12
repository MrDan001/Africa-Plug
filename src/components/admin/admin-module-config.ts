export type ModuleKey = "blog" | "store" | "work-with-fk" | "review-required" | "enquiries" | "subscribers" | "analytics" | "media" | "settings" | "site-settings";
export type CmsRecord = { id: string; module: string; title: string; slug: string | null; status: string; data: Record<string, unknown>; created_at: string; updated_at: string };
export type Draft = { id?: string; title: string; slug: string; status: string; data: Record<string, unknown> };
export type Field = { key: string; label: string; type?: "text" | "textarea" | "url" | "number" | "date" | "datetime-local" | "checkbox" | "select" | "image-upload"; help?: string; rows?: number; placeholder?: string; options?: { value: string; label: string }[] };

export const DETAILS: Record<ModuleKey, { title: string; description: string; db: string }> = {
  blog: { title: "Blog & editorial", description: "Write, schedule and publish articles. Choose the territory, homepage feature, images, byline and search previews, then email confirmed Blog readers when a story is live.", db: "articles" },
  store: { title: "Store products", description: "Add and manage Store products, upload cover images, set prices and control catalogue visibility. Product listings and image uploads work independently of payment setup.", db: "products" },
  "work-with-fk": { title: "Work With FK", description: "Review incoming applications and keep every decision recorded in the admin inbox.", db: "applications" },
  "review-required": { title: "Review required", description: "Applications waiting for a decision. Approve or decline each one to keep the queue current.", db: "applications" },
  enquiries: { title: "Enquiries & forms", description: "Track Contact, Partner With TAP, Ask TAP and T.A.P IN expressions of interest in one persistent inbox.", db: "enquiries" },
  subscribers: { title: "Subscribers", description: "Manage Stay Plugged In, T.A.P IN alerts and the separate Blog readers list. Export confirmed Blog readers when needed.", db: "subscribers" },
  analytics: { title: "Analytics & funnel", description: "Review page views, content views, form-related events and UTM/source information captured by the website.", db: "analytics" },
  media: { title: "Media library", description: "Upload reusable public images and PDFs and copy their asset URLs into articles and product records. Do not upload confidential or paid-download files here.", db: "media" },
  settings: { title: "Commercial settings", description: "Keep the current fees, meeting length, booking rules and draft commercial terms together. Payment automation should only be enabled after terms are approved.", db: "commercial-settings" },
  "site-settings": { title: "Site & SEO Settings", description: "Manage site identity, footer social links, navigation, search-engine details, store features and switches in one place.", db: "site-settings" },
};

export const FIELDS: Partial<Record<ModuleKey, Field[]>> = {
  blog: [
    { key: "category", label: "Territory", type: "select", options: [{ value: "Business", label: "Business" }, { value: "Investment", label: "Investment" }, { value: "Entertainment", label: "Entertainment" }] },
    { key: "excerpt", label: "One-line article summary", type: "textarea", rows: 2, help: "This appears on the Blog card." },
    { key: "author", label: "Byline", type: "text", placeholder: "FK" },
    { key: "image", label: "Main article image", type: "image-upload", help: "Upload a JPG, PNG, WebP or AVIF image. This image appears on the Blog card and at the top of the article." },
    { key: "imageAlt", label: "Main image alt text", type: "text" },
    { key: "imageCredit", label: "Image credit (optional)", type: "text" },
    { key: "publishedAt", label: "Publish date and time", type: "datetime-local", help: "Set a future date and time to schedule an article. It will appear publicly when that time arrives." },
    { key: "featureOnHomepage", label: "Feature this article on the homepage", type: "checkbox" },
    { key: "tagsText", label: "Tags (comma separated)", type: "text" },
    { key: "takeaway", label: "Article takeaway (optional)", type: "textarea", rows: 3 },
    { key: "body", label: "Article body", type: "textarea", rows: 18, help: "Separate paragraphs with a blank line. Use ## Heading for section headings, > Quote for pull quotes, ![Alt text](https://image-url) for inline images, then Caption: words below an image, and YouTube: https://youtu.be/... for privacy-enhanced embeds. Inline links use [link text](https://url)." },
    { key: "seoTitle", label: "SEO title", type: "text" },
    { key: "seoDescription", label: "SEO description", type: "textarea", rows: 3 },
    { key: "shareImage", label: "Social sharing image URL (optional)", type: "url", help: "Leave blank to use the main article image." },
  ],
  store: [
    { key: "summary", label: "Short product summary", type: "textarea", rows: 3 },
    { key: "description", label: "Product description", type: "textarea", rows: 5 },
    { key: "price", label: "Price (numeric)", type: "number", help: "Enter the amount only. This catalogue value does not activate checkout by itself." },
    { key: "currency", label: "Currency code", type: "text", placeholder: "GBP" },
    { key: "imageUrl", label: "Product cover image", type: "image-upload", help: "Upload a JPG, PNG, WebP or AVIF cover image directly here. It will be stored in Supabase public media storage and attached to this product." },
    { key: "imageAlt", label: "Product image alt text", type: "text" },
    { key: "productType", label: "Product type", type: "select", options: [{ value: "Guide", label: "Guide" }, { value: "Service", label: "Service" }], help: "Products appear under the matching Guides or Services tab." },
    { key: "externalUrl", label: "Partner or booking link (Stay Finder only)", type: "url", placeholder: "https://", help: "Optional. For Stay Finder or other outside products: an https:// link to the provider. When filled, the product links out and is never sold through the cart." },
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
    { key: "navigationText", label: "Navigation links (one per line: label | /path)", type: "textarea", rows: 6, help: "Use internal paths only, e.g. T.A.P IN | /tap-in. Leave blank to use the standard navigation." },
    { key: "siteDescription", label: "Default SEO description", type: "textarea", rows: 3 },
    { key: "contactEmail", label: "Public contact email", type: "text" },
    { key: "whatsappUrl", label: "WhatsApp URL", type: "url" },
    { key: "linkedinUrl", label: "LinkedIn URL", type: "url", help: "Footer social link. Leave blank to hide this link." },
    { key: "instagramUrl", label: "Instagram URL", type: "url", help: "Footer social link. Leave blank to hide this link." },
    { key: "footerYoutubeUrl", label: "YouTube channel URL", type: "url", help: "Footer social link. Leave blank to hide this link. Intro video is managed separately." },
    { key: "tiktokUrl", label: "TikTok URL", type: "url", help: "Footer social link. Leave blank to hide this link." },
    { key: "facebookUrl", label: "Facebook URL", type: "url", help: "Footer social link. Leave blank to hide this link." },
    { key: "enableNewsletter", label: "Show newsletter signup", type: "checkbox" },
    { key: "enableSearch", label: "Enable site search", type: "checkbox" },
    { key: "enableSelectedWork", label: "Show selected work", type: "checkbox" },
    { key: "enableProductOfMonth", label: "Show Product of the Month on the homepage", type: "checkbox", help: "Needs the product name, TAP write-up and external link below. Leave off until you are ready to feature a product." },
    { key: "potmName", label: "Product of the Month: product name", type: "text" },
    { key: "potmPartner", label: "Product of the Month: partner / brand", type: "text" },
    { key: "potmMonthLabel", label: "Product of the Month: month label", type: "text", placeholder: "November 2026" },
    { key: "potmWriteUp", label: "Product of the Month: TAP write-up", type: "textarea", rows: 6, help: "Separate paragraphs with a blank line." },
    { key: "potmImageUrl", label: "Product of the Month: image URL", type: "url", help: "Upload in Media library and paste the public https:// URL." },
    { key: "potmUrl", label: "Product of the Month: external link (https://)", type: "url", help: "Your affiliate or partner link. Shown with the disclosure “TAP may earn a commission.”" },
    { key: "potmDiscountCode", label: "Product of the Month: discount code (optional)", type: "text" },
    { key: "potmDiscountNote", label: "Product of the Month: discount note (optional)", type: "text", placeholder: "10% off until 30 November" },
    { key: "tapInFilterThreshold", label: "Show T.A.P IN filters at this many live listings", type: "number", help: "Filters remain hidden below this count. Enter a whole number from 1 to 100." },
  ],
};

/** Which Site & SEO fields appear on which tab. */
export const SETTINGS_TABS: { id: string; label: string; blurb: string; keys: string[] }[] = [
  { id: "info", label: "Site information", blurb: "Your brand name and public contact details.", keys: ["siteTitle", "contactEmail", "whatsappUrl"] },
  { id: "social", label: "Footer social links", blurb: "Edit the public social links shown in the footer. Keep the order shown here; clear a URL to hide that platform.", keys: ["linkedinUrl", "instagramUrl", "footerYoutubeUrl", "tiktokUrl", "facebookUrl"] },
  { id: "navigation", label: "Navigation", blurb: "The links shown in the main site menu.", keys: ["navigationText"] },
  { id: "seo", label: "SEO", blurb: "What search engines and link previews show by default.", keys: ["siteDescription"] },
  { id: "store", label: "Store & Product of the Month", blurb: "Feature one partner product on the homepage.", keys: ["enableProductOfMonth", "potmName", "potmPartner", "potmMonthLabel", "potmWriteUp", "potmImageUrl", "potmUrl", "potmDiscountCode", "potmDiscountNote"] },
  { id: "switches", label: "Features & switches", blurb: "Turn site features on or off.", keys: ["enableNewsletter", "enableSearch", "enableSelectedWork", "tapInFilterThreshold"] },
];

export const STATUS_OPTIONS: Partial<Record<ModuleKey, { value: string; label: string }[]>> = {
  blog: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "archived", label: "Archived" }],
  store: [{ value: "draft", label: "Draft" }, { value: "active", label: "Visible in catalogue" }, { value: "archived", label: "Archived" }],
  subscribers: [{ value: "pending", label: "Awaiting confirmation" }, { value: "active", label: "Active" }, { value: "unsubscribed", label: "Unsubscribed" }],
  settings: [{ value: "active", label: "Current settings" }],
  "site-settings": [{ value: "active", label: "Current settings" }],
};

/** T.A.P IN submissions arrive in the shared enquiries inbox. These labels and filters make them easy to tell apart. */
export const TAP_IN_KINDS: { value: string; label: string }[] = [
  { value: "interest", label: "Express Interest" },
  { value: "register", label: "Register Interest" },
  { value: "opportunity", label: "Opportunity submissions" },
];

export function enquiryKind(record: CmsRecord): string {
  const kind = text(record.data?.kind);
  if (kind === "partner" && text(record.data?.enquiryType) === "Article pitch") return "article-pitch";
  return TAP_IN_KINDS.some((item) => item.value === kind) ? kind : "other";
}

export function subscriberList(record: CmsRecord): string {
  const list = text(record.data?.list);
  return list === "tap-in-alerts" || list === "blog" ? list : "other";
}

export function subscriberListLabel(record: CmsRecord): string {
  return subscriberList(record) === "tap-in-alerts" ? "T.A.P IN alerts" : subscriberList(record) === "blog" ? "Blog readers" : "Stay Plugged In";
}

export function text(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return "";
}

export function tone(status: string) {
  if (["published", "active", "approved", "resolved", "recorded"].includes(status)) return "ok";
  if (["declined", "unsubscribed", "archived"].includes(status)) return "bad";
  if (["review-required", "pending", "submitted", "new", "draft", "in-progress"].includes(status)) return "warn";
  return "neutral";
}

export function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 160);
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function todayDateTime() {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  date.setMinutes(Math.ceil(date.getMinutes() / 5) * 5, 0, 0);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function toLocalDateTime(value: string) {
  if (!value) return todayDateTime();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value.slice(0, 16);
  return new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function defaultSiteSettings(): Draft {
  return {
    title: "Site settings",
    slug: "site-settings",
    status: "active",
    data: { siteTitle: "The Africa Plug", siteDescription: "", contactEmail: "", whatsappUrl: "", linkedinUrl: "https://www.linkedin.com/company/the-africa-plug/", instagramUrl: "https://www.instagram.com/theafricaplug/", youtubeUrl: "https://www.youtube.com/watch?v=KnY5dnnuLc4", footerYoutubeUrl: "https://www.youtube.com/@TheAfricaPlugYT", tiktokUrl: "https://www.tiktok.com/@theafricaplug", facebookUrl: "https://www.facebook.com/profile.php?id=61595019957013", navigationText: ["T.A.P IN | /tap-in", "WORK WITH FK | /work-with-fk", "STORE | /store", "BLOG | /blog", "CONTACT | /contact", "ABOUT | /about"].join("\n"), enableNewsletter: false, enableSearch: true, enableSelectedWork: true, enableProductOfMonth: false, tapInFilterThreshold: 6 },
  };
}

export function toDraft(record?: CmsRecord, moduleKey?: ModuleKey): Draft {
  const source = record?.data ?? {};
  const siteDefaults = moduleKey === "site-settings" ? defaultSiteSettings().data : {};
  const data: Record<string, unknown> = { ...siteDefaults, ...source };
  if (moduleKey === "blog") {
    data.tagsText = Array.isArray(source.tags) ? source.tags.map(String).join(", ") : "";
    data.body = Array.isArray(source.sections)
      ? source.sections.map((section) => {
          if (!section || typeof section !== "object") return "";
          const item = section as Record<string, unknown>;
          const parts = [
            text(item.heading) ? "## " + text(item.heading) : "",
            ...(Array.isArray(item.paragraphs) ? item.paragraphs.map(String) : []),
            text(item.pullQuote) ? "> " + text(item.pullQuote) : "",
            text(item.image) ? "![" + text(item.imageAlt) + "](" + text(item.image) + ")" : "",
            text(item.caption) ? "Caption: " + text(item.caption) : "",
            text(item.youtubeUrl) ? "YouTube: " + text(item.youtubeUrl) : "",
          ].filter(Boolean);
          return parts.join("\n\n");
        }).filter(Boolean).join("\n\n")
      : text(source.body);
    data.publishedAt = toLocalDateTime(text(source.publishedAt));
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

export function makeData(moduleKey: ModuleKey, draft: Draft) {
  const data: Record<string, unknown> = { ...draft.data };
  if (moduleKey === "blog") {
    const tagsText = text(data.tagsText);
    const body = text(data.body);
    data.tags = tagsText.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 30);
    const sections: Record<string, unknown>[] = [];
    let current: Record<string, unknown> = { heading: "", paragraphs: [] as string[] };
    const flush = () => {
      const paragraphs = current.paragraphs as string[];
      if (text(current.heading) || paragraphs.length || text(current.image) || text(current.pullQuote) || text(current.youtubeUrl)) sections.push(current);
      current = { heading: "", paragraphs: [] as string[] };
    };
    for (const block of body.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean)) {
      if (/^##\s+/.test(block)) {
        flush();
        current.heading = block.replace(/^##\s+/, "").trim();
      } else if (/^>\s*/.test(block)) {
        current.pullQuote = block.replace(/^>\s*/, "").trim();
      } else {
        const imageMatch = block.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/);
        const videoMatch = block.match(/^YouTube:\s*(https?:\/\/\S+)$/i);
        if (imageMatch) {
          current.imageAlt = imageMatch[1].trim();
          current.image = imageMatch[2].trim();
        } else if (/^Caption:\s*/i.test(block)) {
          current.caption = block.replace(/^Caption:\s*/i, "").trim();
        } else if (videoMatch) {
          current.youtubeUrl = videoMatch[1].trim();
        } else {
          (current.paragraphs as string[]).push(block);
        }
      }
    }
    flush();
    data.sections = sections;
    const scheduledAt = text(data.publishedAt);
    data.publishedAt = Number.isNaN(Date.parse(scheduledAt)) ? new Date().toISOString() : new Date(scheduledAt).toISOString();
    data.author = text(data.author) || "FK";
    delete data.tagsText;
    delete data.body;
    delete data.readingTime;
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
