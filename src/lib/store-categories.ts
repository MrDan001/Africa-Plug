// FILE PATH: src/lib/store-categories.ts
// The Store is not a bookstore: it holds ebooks, playbooks, reports, Stay Finder and other TAP products.
// Admin keeps typing a plain "Product type"; this file turns that text into one of the five Store categories.

export type StoreCategoryId = "ebooks" | "playbooks" | "reports" | "stay-finder" | "tap-products";

export type StoreCategory = {
  id: StoreCategoryId;
  label: string;      // shown on the category tabs
  singular: string;   // shown on each product card
  blurb: string;      // one line shown when the tab is selected
  emptyTitle: string; // shown when the tab has no products yet
};

export const STORE_CATEGORIES: readonly StoreCategory[] = [
  { id: "ebooks", label: "Ebooks", singular: "Ebook", blurb: "Practical reading to help you move with confidence.", emptyTitle: "Ebooks are on the way." },
  { id: "playbooks", label: "Playbooks", singular: "Playbook", blurb: "Step-by-step frameworks you can put straight into action.", emptyTitle: "Playbooks are on the way." },
  { id: "reports", label: "Reports", singular: "Report", blurb: "Research and insight to inform your next move.", emptyTitle: "Reports are on the way." },
  { id: "stay-finder", label: "Stay Finder", singular: "Stay Finder", blurb: "Discover places to stay. Bookings are handled by the accommodation providers.", emptyTitle: "Stay Finder is on the way." },
  { id: "tap-products", label: "Other TAP products", singular: "TAP product", blurb: "Other useful products from The Africa Plug.", emptyTitle: "More TAP products are on the way." },
];

export function resolveStoreCategory(productType: string): StoreCategoryId {
  const text = productType.toLowerCase();
  if (/stay/.test(text)) return "stay-finder";
  if (/play\s*-?book/.test(text)) return "playbooks";
  if (/report|research/.test(text)) return "reports";
  if (/e-?\s?book|guide/.test(text)) return "ebooks";
  return "tap-products";
}

export function parseStoreCategory(value: unknown): StoreCategoryId | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return STORE_CATEGORIES.find((category) => category.id === raw)?.id ?? null;
}

export function getStoreCategory(id: StoreCategoryId): StoreCategory {
  return STORE_CATEGORIES.find((category) => category.id === id) ?? STORE_CATEGORIES[STORE_CATEGORIES.length - 1];
}