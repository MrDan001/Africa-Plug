import type { OpportunityInput, OpportunityStatus } from "./opportunities";

const STATUSES = new Set<OpportunityStatus>(["draft", "live", "closed", "archived"]);

function text(value: unknown, label: string, max: number, min = 0) {
  if (typeof value !== "string") throw new Error(`${label} is required.`);
  const normalized = value.trim();
  if (normalized.length < min) throw new Error(`${label} must contain at least ${min} characters.`);
  if (normalized.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return normalized;
}

function optionalText(value: unknown, label: string, max: number) {
  if (value == null || value === "") return null;
  return text(value, label, max);
}

export function slugify(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "opportunity";
}

export function parseOpportunityInput(value: unknown): OpportunityInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Provide the opportunity details and try again.");
  }
  const data = value as Record<string, unknown>;
  const title = text(data.title, "Title", 180, 2);
  const slug = slugify(typeof data.slug === "string" && data.slug.trim() ? data.slug : title);
  const country = text(data.country ?? "", "Country", 120);
  const region = text(data.region ?? "", "Region", 120);
  if (!country && !region) throw new Error("Provide a country and/or region.");
  const sector = text(data.sector, "Sector", 120, 2);
  const opportunityType = text(data.opportunity_type ?? data.opportunityType, "Opportunity type", 120, 2);
  const description = text(data.description, "Description", 12000, 10);
  const whoThisIsFor = text(data.who_this_is_for ?? data.whoThisIsFor, "Who this is for", 3000, 5);
  const rawQuestions = data.enquiry_questions ?? data.enquiryQuestions;
  if (!Array.isArray(rawQuestions) || rawQuestions.length < 2 || rawQuestions.length > 4) {
    throw new Error("Add between 2 and 4 custom enquiry questions.");
  }
  const enquiryQuestions = rawQuestions.map((question, index) => text(question, `Question ${index + 1}`, 500, 3));
  const statusValue = data.status ?? "draft";
  if (typeof statusValue !== "string" || !STATUSES.has(statusValue as OpportunityStatus)) {
    throw new Error("Choose Draft, Live, Closed, or Archived.");
  }

  return {
    slug,
    title,
    country,
    region,
    sector,
    opportunity_type: opportunityType,
    description,
    who_this_is_for: whoThisIsFor,
    enquiry_questions: enquiryQuestions,
    status: statusValue as OpportunityStatus,
    image_url: optionalText(data.image_url ?? data.imageUrl, "Image URL", 2000),
    share_image_url: optionalText(data.share_image_url ?? data.shareImageUrl, "Share image URL", 2000),
    seo_title: optionalText(data.seo_title ?? data.seoTitle, "SEO title", 180),
    seo_description: optionalText(data.seo_description ?? data.seoDescription, "SEO description", 320),
  };
}
