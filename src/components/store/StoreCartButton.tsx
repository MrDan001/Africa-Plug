// FILE PATH: src/components/store/StoreCartButton.tsx
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  changeStoreCartQuantity,
  formatMoney,
  readStoreCart,
  removeStoreCartItem,
  STORE_CART_EVENT,
  type StoreCartItem,
} from "./cart";
import "./store-cart.css";

const MAX_QUANTITY = 10;

function BagIcon({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path d="M5.2 8h13.6l1 11.2a1.8 1.8 0 0 1-1.8 2H6a1.8 1.8 0 0 1-1.8-2L5.2 8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M8.5 10.5V7a3.5 3.5 0 0 1 7 0v3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

type Props = { mobileFloating?: boolean };

export default function StoreCartButton({ mobileFloating = false }: Props) {
  const [items, setItems] = useState<StoreCartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    const refresh = () => setItems(readStoreCart());
    refresh();
    window.addEventListener(STORE_CART_EVENT, refresh);
    window.addEventListener("storage", refresh);
    // Returning from Stripe with the browser Back button restores this page from cache.
    const resetOnReturn = (event: PageTransitionEvent) => {
      if (event.persisted) { setCheckingOut(false); refresh(); }
    };
    window.addEventListener("pageshow", resetOnReturn);
    return () => {
      window.removeEventListener(STORE_CART_EVENT, refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("pageshow", resetOnReturn);
    };
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Escape to close, simple focus trap, and page scroll lock while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { close(); return; }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], [tabindex]:not([tabindex='-1'])");
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const currencies = new Set(items.map((item) => item.currency || "GBP"));
  const mixedCurrencies = currencies.size > 1;
  const cartCurrency = items[0]?.currency || "GBP";
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function beginCheckout() {
    setCheckingOut(true);
    setCheckoutError("");
    try {
      const response = await fetch("/api/store/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((item) => ({ slug: item.slug, quantity: item.quantity })) }),
      });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "Checkout is temporarily unavailable.");
      window.location.assign(result.url);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Checkout is temporarily unavailable.");
      setCheckingOut(false);
    }
  }

  const drawer = open ? (
    <div className={"tapcart-overlay"} onClick={close}>
      <section
        ref={panelRef}
        className={"tapcart-panel"}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tap-store-cart-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={"tapcart-head"}>
          <div>
            <p className={"tapcart-eyebrow"}>THE AFRICA PLUG</p>
            <h2 id="tap-store-cart-title" className={"tapcart-title"}>Your cart <span>({quantity})</span></h2>
          </div>
          <button ref={closeRef} type="button" className={"tapcart-close"} onClick={close} aria-label="Close shopping cart">×</button>
        </header>

        {items.length === 0 ? (
          <div className={"tapcart-body"}>
            <div className={"tapcart-empty"}>
              <div className={"tapcart-empty-icon"}><BagIcon size={34} /></div>
              <h3>Your cart is empty.</h3>
              <p>Add a TAP product and it will be kept here while you browse.</p>
              <button type="button" className={"tapcart-checkout"} onClick={close}>EXPLORE PRODUCTS</button>
            </div>
          </div>
        ) : (
          <>
            <div className={"tapcart-body"}>
              {items.map((item) => (
                <article className={"tapcart-item"} key={item.slug}>
                  <div className={"tapcart-cover"} aria-hidden="true"><span>THE<br />AFRICA<br />PLUG</span></div>
                  <div className={"tapcart-copy"}>
                    <h3 className={"tapcart-name"}>{item.title}</h3>
                    <p className={"tapcart-each"}>{formatMoney(item.price, item.currency || "GBP")} each</p>
                    <div className={"tapcart-controls"}>
                      <div className={"tapcart-stepper"}>
                        <button type="button" aria-label={"Decrease quantity of " + item.title} onClick={() => changeStoreCartQuantity(item.slug, item.quantity - 1)}>−</button>
                        <output aria-live="polite">{item.quantity}</output>
                        <button type="button" aria-label={"Increase quantity of " + item.title} disabled={item.quantity >= MAX_QUANTITY} onClick={() => changeStoreCartQuantity(item.slug, item.quantity + 1)}>+</button>
                      </div>
                      <button type="button" className={"tapcart-remove"} onClick={() => removeStoreCartItem(item.slug)}>Remove</button>
                    </div>
                  </div>
                  <strong className={"tapcart-line-total"}>{formatMoney(item.price * item.quantity, item.currency || "GBP")}</strong>
                </article>
              ))}
            </div>

            <footer className={"tapcart-foot"}>
              <div className={"tapcart-subtotal"}>
                <span>Subtotal</span>
                <strong>{mixedCurrencies ? "Multiple currencies" : formatMoney(subtotal, cartCurrency)}</strong>
              </div>
              <p className={"tapcart-note"}>
                {mixedCurrencies
                  ? "Your cart contains different currencies. Remove products until only one currency remains to continue."
                  : "Secure checkout is provided by Stripe. Prices are verified against the Store catalogue before payment. Your download links appear as soon as payment is confirmed."}
              </p>
              {checkoutError ? <p role="alert" className={"tapcart-error"}>{checkoutError}</p> : null}
              <button type="button" className={"tapcart-checkout"} onClick={beginCheckout} disabled={checkingOut || mixedCurrencies}>
                {checkingOut ? "CONNECTING TO STRIPE…" : "CONTINUE TO SECURE CHECKOUT"} <span aria-hidden="true">→</span>
              </button>
              <button type="button" className={"tapcart-continue"} onClick={close}>CONTINUE BROWSING</button>
            </footer>
          </>
        )}
      </section>
    </div>
  ) : null;

  return (
    <div className={"tapcart-root" + (mobileFloating ? " " + "tapcart-floating" : "")}>
      <button
        ref={triggerRef}
        type="button"
        className={"tapcart-trigger"}
        aria-label={"Open shopping cart, " + quantity + (quantity === 1 ? " item" : " items")}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <BagIcon />
        {quantity > 0 ? <span key={quantity} className={"tapcart-badge" + " " + "tapcart-badge-pop"}>{quantity > 99 ? "99+" : quantity}</span> : null}
      </button>
      {mounted && drawer ? createPortal(drawer, document.body) : null}
    </div>
  );
}