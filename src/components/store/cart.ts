export type StoreCartItem = { slug: string; title: string; price: number; quantity: number; cover: string; currency: string };
export const STORE_CART_KEY = "tap-store-cart-v1";
export const STORE_CART_EVENT = "tap-store-cart-updated";

function announceCartChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(STORE_CART_EVENT));
}

export function readStoreCart(): StoreCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORE_CART_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((candidate): StoreCartItem[] => {
      if (!candidate || typeof candidate !== "object") return [];
      const item = candidate as Record<string, unknown>;
      if (typeof item.slug !== "string" || typeof item.title !== "string" ||
        typeof item.price !== "number" || !Number.isFinite(item.price) || item.price < 0 ||
        typeof item.quantity !== "number" || !Number.isInteger(item.quantity) || item.quantity < 1 ||
        typeof item.cover !== "string") return [];
      return [{
        slug: item.slug,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        cover: item.cover,
        currency: typeof item.currency === "string" && /^[A-Za-z]{3}$/.test(item.currency)
          ? item.currency.toUpperCase()
          : "GBP",
      }];
    });
  } catch {
    return [];
  }
}

export function writeStoreCart(items: StoreCartItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORE_CART_KEY, JSON.stringify(items));
    announceCartChange();
  } catch {
    // Keep the catalogue usable if browser storage is unavailable.
  }
}

export function parseBookPrice(price: string): number {
  const amount = Number(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

export function formatMoney(amount: number, currency = "GBP"): string {
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatGBP(amount: number): string {
  return formatMoney(amount, "GBP");
}

export function addStoreCartItem(item: Omit<StoreCartItem, "quantity">) {
  const items = readStoreCart();
  const existing = items.find((entry) => entry.slug === item.slug);
  if (existing) {
    writeStoreCart(items.map((entry) => entry.slug === item.slug
      ? { ...entry, quantity: Math.min(entry.quantity + 1, 10) }
      : entry));
    return;
  }
  writeStoreCart([...items, { ...item, quantity: 1 }]);
}

export function changeStoreCartQuantity(slug: string, nextQuantity: number) {
  const items = readStoreCart();
  if (nextQuantity < 1) {
    writeStoreCart(items.filter((item) => item.slug !== slug));
    return;
  }
  writeStoreCart(items.map((item) => item.slug === slug ? { ...item, quantity: Math.min(nextQuantity, 10) } : item));
}

export function removeStoreCartItem(slug: string) {
  writeStoreCart(readStoreCart().filter((item) => item.slug !== slug));
}
