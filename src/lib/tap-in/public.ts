// FILE PATH: src/lib/tap-in/public.ts
// Shared (server and browser) helpers for the public T.A.P IN page.

export type PublicListing = {
    id: string;
    slug: string;
    title: string;
    country: string;
    sector: string;
    opportunity_type: string;
    description: string;
    who_this_is_for: string;
    image_url: string | null;
    open: boolean;
  };
  
  export const TYPE_FILTERS = ["Products", "Services", "Projects"] as const;
  
  /** Maps whatever the admin typed ("Service", "services", "Product") onto the three public Type filters. */
  export function typeGroup(value: string): string {
    const v = value.trim().toLowerCase();
    if (v.startsWith("product")) return "Products";
    if (v.startsWith("service")) return "Services";
    if (v.startsWith("project")) return "Projects";
    return "";
  }
  
  export function placeLabel(item: Pick<PublicListing, "country">) {
    return item.country;
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