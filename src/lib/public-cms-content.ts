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
      if (!heading && paragraphs.length === 0 && !checklist?.length) return [];
      return [{ heading, paragraphs, ...(checklist?.length ? { checklist } : {}) }];
    });
  }
  const body = stringValue(data.body);
  return body.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean).map((paragraph) => ({ heading: "", paragraphs: [paragraph] }));
}

export function cmsRecordToBlogPost(record: CmsRecord): BlogPost | null {
  if (!record.slug || record.status !== "published") return null;
  const data = record.data ?? {};
  const title = record.title || stringValue(data.title);
  if (!title) return null;
  const publishedRaw = stringValue(data.publishedAt) || record.updated_at;
  const parsedDate = new Date(publishedRaw);
  const publishedAt = Number.isNaN(parsedDate.getTime())
    ? publishedRaw
    : parsedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
  const image = stringValue(data.image) || stringValue(data.shareImage);
  return {
    slug: record.slug,
    category: stringValue(data.category, "The TAP Journal"),
    title,
    excerpt: stringValue(data.excerpt),
    image,
    imageAlt: stringValue(data.imageAlt, `Cover image for ${title}`),
    publishedAt,
    readingTime: stringValue(data.readingTime, "5 min read"),
    author: stringValue(data.author, "The TAP Journal Editorial Desk"),
    tags: stringArray(data.tags),
    takeaway: stringValue(data.takeaway),
    sections: sectionsFromData(data),
    seoTitle: stringValue(data.seoTitle),
    seoDescription: stringValue(data.seoDescription),
    shareImage: stringValue(data.shareImage),
  };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const records = await getPublicCmsRecords("articles");
  const cmsPosts = records.map(cmsRecordToBlogPost).filter((post): post is BlogPost => post !== null);
  return cmsPosts;
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
    productType: stringValue(data.productType, "Digital resource"),
    category: resolveStoreCategory(stringValue(data.productType, "Digital resource")),
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