// FILE PATH: src/lib/tap-in/public.ts
// Shared (server and browser) helpers for the public T.A.P IN page.

export type PublicListing = {
    id: string;
    slug: string;
    title: string;
    country: string;
    region: string;
    sector: string;
    opportunity_type: string;
    description: string;
    who_this_is_for: string;
    image_url: string | null;
    open: boolean;
  };
  
  export const TYPE_FILTERS = ["Products", "Services", "Projects"] as const;
  export const REGION_FILTERS = ["North Africa", "East Africa", "West Africa", "Central Africa", "Southern Africa", "Pan African"] as const;
  
  /** Maps whatever the admin typed ("Service", "services", "Product") onto the three public Type filters. */
  export function typeGroup(value: string): string {
    const v = value.trim().toLowerCase();
    if (v.startsWith("product")) return "Products";
    if (v.startsWith("service")) return "Services";
    if (v.startsWith("project")) return "Projects";
    return "";
  }
  
  /** Maps the stored region onto the six public Region filters ("Pan-African", "pan africa" and so on all count). */
  export function regionGroup(region: string): string {
    const v = region.trim().toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
    if (!v) return "";
    if (v.startsWith("pan")) return "Pan African";
    return REGION_FILTERS.find((item) => item.toLowerCase() === v) ?? "";
  }
  
  export function placeLabel(item: Pick<PublicListing, "region" | "country">) {
    return item.region || item.country;
  }
  
  export function metaLine(item: PublicListing) {
    return [item.sector, placeLabel(item), item.opportunity_type].filter(Boolean).join(" · ");
  }
  
  /** Descriptive alt text, for example "Excavator Hire, construction opportunity in West Africa". */
  export function altText(item: PublicListing) {
    const place = placeLabel(item);
    return `${item.title}, ${item.sector.toLowerCase()} opportunity${place ? ` in ${place}` : ""}`;
  }
  
  /** Short card description: the first sentence, or the first ~140 characters. */
  export function blurb(text: string, max = 140) {
    const clean = text.replace(/\s+/g, " ").trim();
    const sentence = clean.match(/^.{20,}?[.!?](?=\s|$)/)?.[0];
    if (sentence && sentence.length <= max) return sentence;
    if (clean.length <= max) return clean;
    return `${clean.slice(0, max).replace(/\s+\S*$/, "")}…`;
  }