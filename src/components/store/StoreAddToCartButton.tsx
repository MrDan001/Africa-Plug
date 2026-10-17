"use client";
import { useEffect, useState } from "react";
import { addStoreCartItem, parseBookPrice } from "./cart";

type Props = { slug: string; title: string; price: string; currency?: string; cover: string; compact?: boolean };

function CartPlusIcon() {
  return <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true"><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="10" cy="20" r="1.2" fill="currentColor"/><circle cx="18" cy="20" r="1.2" fill="currentColor"/><path d="M14 5v6M11 8h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
}

export default function StoreAddToCartButton({ slug, title, price, currency = "GBP", cover, compact = false }: Props) {
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1600);
    return () => window.clearTimeout(timer);
  }, [added]);

  function handleAdd() {
    addStoreCartItem({ slug, title, price: parseBookPrice(price), currency: currency.toUpperCase(), cover });
    setAdded(true);
  }

  return <button type="button" className={"tap-store-add-button" + (compact ? " tap-store-add-button--compact" : "") + (added ? " is-added" : "")} onClick={handleAdd} aria-label={added ? title + " added to basket" : "Add " + title + " to basket"} title={added ? "Added to basket" : "Add to basket"}>{added ? <svg viewBox="0 0 24 24" width={compact ? "18" : "20"} height={compact ? "18" : "20"} fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> : <CartPlusIcon/>}{!compact ? <span>{added ? "ADDED TO BASKET" : "ADD TO BASKET"}</span> : null}</button>;
}
