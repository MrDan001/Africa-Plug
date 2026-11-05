// FILE PATH: src/lib/public-cms-content.ts
import type { BlogPost, BlogSection } from "@/lib/blog-posts";
import { getPublicCmsRecords, type CmsRecord } from "@/lib/cms-bridge";
import { resolveStoreCategory } from "@/lib/store-categories";

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : typeof value === "number" ? String(value) : fallback;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function sectionsFromData(data: Record<string, unknown>): BlogSection[] {
  if (Array.isArray(data.sections)) {
    return data.sections.flatMap((section): BlogSection[] => {
      if (!section || typeof section !== "object") return [];
      const item = section as Record<string, unknown>;
      const paragraphs = stringArray(item.paragraphs);
      const heading = stringValue(item.heading);
      const checklist = Array.isArray(item.checklist) ? item.checklist.flatMap((entry) => {
        if (!entry || typeof entry !== "object") return [];
        const row = entry as Record<string, unknown>;
        const label = stringValue(row.label);
        const detail = stringValue(row.detail);
        return label && detail ? [{ label, detail }] : [];
      }) : undefined;
      const image = stringValue(item.image);
      const imageAlt = stringValue(item.imageAlt);
      const caption = stringValue(item.caption);
      const pullQuote = stringValue(item.pullQuote);
      const youtubeUrl = stringValue(item.youtubeUrl);
      if (!heading && paragraphs.length === 0 && !checklist?.length && !image && !pullQuote && !youtubeUrl) return [];
      return [{
        heading,
        paragraphs,
        ...(checklist?.length ? { checklist } : {}),
        ...(image ? { image, imageAlt, caption } : {}),
        ...(pullQuote ? { pullQuote } : {}),
        ...(youtubeUrl ? { youtubeUrl } : {}),
      }];
    });
  }
  const body = stringValue(data.body);
  return body.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean).map((paragraph) => ({ heading: "", paragraphs: [paragraph] }));
}

function readingTimeFor(title: string, excerpt: string, sections: BlogSection[]) {
  const words = [title, excerpt, ...sections.flatMap((section) => [
    ...section.paragraphs,
    section.heading,
    section.pullQuote ?? "",
    ...(section.checklist ?? []).flatMap((item) => [item.label, item.detail]),
  ])].join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200)) + " min";
}

export function cmsRecordToBlogPost(record: CmsRecord): BlogPost | null {
  if (!record.slug || record.status !== "published") return null;
  const data = record.data ?? {};
  const title = record.title || stringValue(data.title);
  if (!title) return null;
  const publishedRaw = stringValue(data.publishedAt) || record.updated_at;
  const publishedDate = new Date(publishedRaw);
  if (Number.isNaN(publishedDate.getTime()) || publishedDate.getTime() > Date.now()) return null;
  const publishedAt = publishedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
  const image = stringValue(data.image) || stringValue(data.shareImage);
  const excerpt = stringValue(data.excerpt);
  const sections = sectionsFromData(data);
  return {
    slug: record.slug,
    category: stringValue(data.category, "Business"),
    title,
    excerpt,
    image,
    imageAlt: stringValue(data.imageAlt, `Cover image for ${title}`),
    imageCredit: stringValue(data.imageCredit),
    publishedAt,
    readingTime: readingTimeFor(title, excerpt, sections),
    author: stringValue(data.author, "FK"),
    tags: stringArray(data.tags),
    takeaway: stringValue(data.takeaway),
    sections,
    featureOnHomepage: data.featureOnHomepage === true,
    seoTitle: stringValue(data.seoTitle),
    seoDescription: stringValue(data.seoDescription),
    shareImage: stringValue(data.shareImage),
  };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const records = await getPublicCmsRecords("articles");
  const publishTime = (record: CmsRecord) => {
    const raw = stringValue(record.data?.publishedAt) || record.updated_at;
    const parsed = Date.parse(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  return records
    .sort((a, b) => publishTime(b) - publishTime(a))
    .map(cmsRecordToBlogPost)
    .filter((post): post is BlogPost => post !== null);
}

export async function getPublicBlogPost(slug: string): Promise<BlogPost | null> {
  const cmsPosts = (await getPublicCmsRecords("articles")).map(cmsRecordToBlogPost).filter((post): post is BlogPost => post !== null);
  return cmsPosts.find((post) => post.slug === slug) ?? null;
}

export function cmsRecordToPublicProduct(record: CmsRecord) {
  const data = record.data ?? {};
  if (!record.slug || record.status !== "active" || !record.title) return null;
  const rawPrice = Number(data.price ?? 0);
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    summary: stringValue(data.summary) || stringValue(data.description),
    description: stringValue(data.description) || stringValue(data.summary),
    imageUrl: stringValue(data.imageUrl),
    imageAlt: stringValue(data.imageAlt) || record.title,
    productType: stringValue(data.productType, "Digital resource"),
    category: resolveStoreCategory(stringValue(data.productType, "Digital resource")),
    availability: data.availability === "available" ? "available" : data.availability === "coming-soon" ? "coming-soon" : "coming-soon",
    externalUrl: /^https:\/\//i.test(stringValue(data.externalUrl).trim()) ? stringValue(data.externalUrl).trim() : "",
    currency: stringValue(data.currency, "GBP").toUpperCase(),
    price: Number.isFinite(rawPrice) && rawPrice >= 0 ? rawPrice : 0,
    downloadReady: typeof data.productFileReference === "string"
      && data.productFileReference.startsWith(record.slug + "/")
      && typeof data.productFileUploadedAt === "string"
      && Boolean(data.productFileUploadedAt),
    seoTitle: stringValue(data.seoTitle),
    seoDescription: stringValue(data.seoDescription),
    shareImageUrl: stringValue(data.shareImage || data.shareImageUrl),
    featured: data.featured === true,
  };
}
