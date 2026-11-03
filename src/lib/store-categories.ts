export type StoreCategoryId = "guides" | "services";

export type StoreCategory = {
  id: StoreCategoryId;
  label: string;
  singular: string;
  blurb: string;
  emptyTitle: string;
};

export const STORE_CATEGORIES: readonly StoreCategory[] = [
  { id: "guides", label: "Guides", singular: "Guide", blurb: "Practical guides for exploring and doing business across Africa.", emptyTitle: "Guides are on the way." },
  { id: "services", label: "Services", singular: "Service", blurb: "Personal support for travel, business and life across Africa.", emptyTitle: "Services are on the way." },
];

export function resolveStoreCategory(productType: string): StoreCategoryId {
  return /service|consult|stay finder/i.test(productType) ? "services" : "guides";
}

export function parseStoreCategory(value: unknown): StoreCategoryId | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return STORE_CATEGORIES.find((category) => category.id === raw)?.id ?? null;
}

export function getStoreCategory(id: StoreCategoryId): StoreCategory {
  return STORE_CATEGORIES.find((category) => category.id === id) ?? STORE_CATEGORIES[0];
}
