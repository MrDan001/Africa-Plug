"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type OrderItem = {
  slug?: string;
  description?: string;
  quantity?: number;
  amountTotal?: number;
  currency?: string;
};
type StoreOrder = {
  id: string;
  stripe_session_id: string;
  stripe_event_id: string;
  status: "paid" | "refunded" | "partially_refunded" | "disputed" | "processing" | string;
  customer_email: string;
  currency: string;
  amount_total: number;
  tax_amount: number;
  product_slugs: string[];
  order_items: OrderItem[];
  stripe_payment_intent_id: string;
  checkout_completed_at: string;
  created_at: string;
};

const FILTERS = [
  { value: "all", label: "All orders" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
  { value: "partially_refunded", label: "Partially refunded" },
  { value: "disputed", label: "Disputed" },
  { value: "processing", label: "Processing" },
];

const ZERO_DECIMAL = new Set(["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"]);

function money(amount: number, currency: string) {
  const code = /^[A-Z]{3}$/.test(currency) ? currency : "GBP";
  const divisor = ZERO_DECIMAL.has(code) ? 1 : 100;
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: code }).format(amount / divisor);
  } catch {
    return `${code} ${(amount / divisor).toFixed(2)}`;
  }
}

function dateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function label(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function StoreOrdersClient() {
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/admin/store-orders?status=${encodeURIComponent(status)}`, { cache: "no-store" });
        const payload = await response.json() as { orders?: StoreOrder[]; error?: string };
        if (!response.ok) throw new Error(payload.error || "Could not load Store orders.");
        if (!cancelled) setOrders(Array.isArray(payload.orders) ? payload.orders : []);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Could not load Store orders.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [status]);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((order) => [
      order.customer_email,
      order.stripe_session_id,
      order.stripe_payment_intent_id,
      ...(order.product_slugs || []),
      ...(order.order_items || []).map((item) => item.description || item.slug || ""),
    ].join(" ").toLowerCase().includes(term));
  }, [orders, search]);

  const paidOrders = orders.filter((order) => order.status === "paid");
  const totalPaidOrders = paidOrders.length;
  const totalCustomers = new Set(paidOrders.map((order) => order.customer_email).filter(Boolean)).size;

  return <main className="ap-admin" style={{ minHeight: "100vh", paddingBottom: 48 }}>
    <header className="ap-admin-topbar">
      <Link className="ap-admin-brand" href="/admin"><span>AP</span><b>THE AFRICA PLUG</b></Link>
      <div className="ap-admin-top-actions"><Link href="/admin/store">Store products ↗</Link><Link href="/">View website ↗</Link></div>
    </header>
    <section className="ap-admin-hero" style={{ paddingBottom: 30 }}>
      <p className="ap-admin-eyebrow">THE AFRICA PLUG · COMMERCE</p>
      <h1>Store orders.<br/><em>control.</em></h1>
      <p className="ap-admin-lede">Payment status, order amounts and purchased products. Detailed payment processing and refunds remain managed in Stripe.</p>
      <div className="ap-admin-shortcuts"><Link href="/admin">← Control room</Link><Link href="/admin/store">Manage products ↗</Link></div>
    </section>

    <section style={{ padding: "0 clamp(16px, 4vw, 48px) 26px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, maxWidth: 900 }}>
        <div className="ap-admin-card" style={{ minHeight: 84 }}><small>ORDERS IN VIEW</small><h2>{loading ? "—" : orders.length}</h2></div>
        <div className="ap-admin-card" style={{ minHeight: 84 }}><small>PAID ORDERS IN VIEW</small><h2>{loading ? "—" : totalPaidOrders}</h2></div>
        <div className="ap-admin-card" style={{ minHeight: 84 }}><small>PAID CUSTOMERS</small><h2>{loading ? "—" : totalCustomers}</h2></div>
      </div>
    </section>

    <section style={{ padding: "0 clamp(16px, 4vw, 48px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <div><h2 style={{ margin: 0, fontSize: 24 }}>Orders</h2><p style={{ margin: "6px 0 0", color: "#696a70" }}>{loading ? "Loading…" : `${filteredOrders.length} order${filteredOrders.length === 1 ? "" : "s"} shown`}</p></div>
        <div style={{ display: "flex", alignItems: "end", gap: 8, flexWrap: "wrap" }}>
          <label style={{ fontSize: 12, fontWeight: 700 }}>Search orders<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Email, product or session…" style={{ display: "block", width: "min(80vw,280px)", marginTop: 6, padding: "11px 12px", border: "1px solid #d6d3cf", borderRadius: 4, font: "inherit" }}/></label>
          <label style={{ fontSize: 12, fontWeight: 700 }}>Status<select value={status} onChange={(event) => setStatus(event.target.value)} style={{ display: "block", marginTop: 6, padding: "11px 12px", border: "1px solid #d6d3cf", borderRadius: 4, background: "#fff", font: "inherit" }}>{FILTERS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
          <button type="button" onClick={() => setStatus((value) => value)} style={{ padding: "12px 14px", border: "1px solid #c9c7c2", background: "#fff", cursor: "pointer" }}>Refresh</button>
        </div>
      </div>

      {error ? <div role="alert" className="ap-admin-card" style={{ color: "#8d2028", background: "#fff1f1", padding: 16 }}>{error}</div> : null}
      {loading ? <div className="ap-admin-card" style={{ padding: 24, color: "#696a70" }}>Loading orders…</div>
        : filteredOrders.length ? <div style={{ display: "grid", gap: 12 }}>
          {filteredOrders.map((order) => <article className="ap-admin-card" key={order.id} style={{ padding: "clamp(16px,3vw,24px)", display: "grid", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 14, flexWrap: "wrap" }}>
              <div style={{ minWidth: 0 }}>
                <span style={{ display: "inline-block", padding: "5px 8px", background: order.status === "paid" ? "#e7f6ee" : "#f5efe7", color: order.status === "paid" ? "#176447" : "#7a4e10", fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em" }}>{label(order.status)}</span>
                <h3 style={{ margin: "10px 0 5px", fontSize: 18, overflowWrap: "anywhere" }}>{order.customer_email || "Customer email not recorded"}</h3>
                <p style={{ margin: 0, color: "#696a70", fontSize: 13 }}>{dateTime(order.checkout_completed_at || order.created_at)}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <strong style={{ fontSize: 22 }}>{money(order.amount_total || 0, order.currency || "GBP")}</strong>
                <p style={{ margin: "5px 0 0", color: "#696a70", fontSize: 12 }}>{money(order.tax_amount || 0, order.currency || "GBP")} tax included</p>
              </div>
            </div>
            <div style={{ padding: 14, background: "#f8f7f4", border: "1px solid #ebe7e1" }}>
              <p style={{ margin: "0 0 8px", color: "#5e6066", fontSize: 11, fontWeight: 800, letterSpacing: ".08em" }}>ORDER ITEMS</p>
              {order.order_items?.length ? <div style={{ display: "grid", gap: 8 }}>{order.order_items.map((item, index) => <div key={item.slug ? item.slug + index : index} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start", flexWrap: "wrap", fontSize: 14 }}><span>{item.description || item.slug || "Store product"} <small style={{ color: "#696a70" }}>× {item.quantity ?? 1}</small></span><strong>{money(item.amountTotal || 0, item.currency || order.currency)}</strong></div>)}</div>
                : <p style={{ margin: 0, color: "#696a70" }}>{(order.product_slugs || []).join(", ") || "Order items were not recorded."}</p>}
            </div>
            <details>
              <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Payment reference details</summary>
              <dl style={{ display: "grid", gridTemplateColumns: "minmax(110px,150px) minmax(0,1fr)", gap: "7px 12px", margin: "12px 0 0", fontSize: 12 }}>
                <dt style={{ color: "#696a70" }}>Checkout session</dt><dd style={{ margin: 0, overflowWrap: "anywhere" }}>{order.stripe_session_id}</dd>
                <dt style={{ color: "#696a70" }}>Payment intent</dt><dd style={{ margin: 0, overflowWrap: "anywhere" }}>{order.stripe_payment_intent_id || "Not available"}</dd>
                <dt style={{ color: "#696a70" }}>Tax</dt><dd style={{ margin: 0 }}>{money(order.tax_amount || 0, order.currency || "GBP")}</dd>
              </dl>
            </details>
          </article>)}
        </div>
        : <div className="ap-admin-card" style={{ padding: 28, color: "#696a70" }}>No Store orders match this filter yet. Completed, verified payments will appear here.</div>}
    </section>
    <footer className="ap-admin-footer"><span>THE AFRICA PLUG · ADMIN</span><Link href="/admin">Back to control room ↗</Link><span>Payment records from Stripe.</span></footer>
  </main>;
}
