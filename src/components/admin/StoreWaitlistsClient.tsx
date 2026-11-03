"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import "./StoreWaitlists.css";

type RecordRow = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  data: Record<string, unknown>;
};
type ProductRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  data: Record<string, unknown>;
};
type Notice = { tone: "success" | "error"; text: string };

function value(input: unknown) {
  return typeof input === "string" ? input : input == null ? "" : String(input);
}
function date(valueText: string) {
  const parsed = new Date(valueText);
  return Number.isNaN(parsed.getTime()) ? "Date unavailable" : parsed.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function canEmail(record: RecordRow) {
  return record.data.waitlistEmailConsent === true && !record.data.waitlistUnsubscribedAt && record.data.waitlistStatus !== "unsubscribed";
}
function stateLabel(record: RecordRow) {
  if (record.data.waitlistUnsubscribedAt || record.data.waitlistStatus === "unsubscribed") return "Unsubscribed";
  if (record.data.waitlistLastNotifiedAt) return "Notified";
  if (record.data.waitlistStatus === "contacted") return "Contacted";
  return "Waiting";
}
function csv(valueText: unknown) {
  const text = value(valueText).replace(/"/g, '""');
  return '"' + text + '"';
}

export default function StoreWaitlistsClient() {
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [sending, setSending] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notice, setNotice] = useState<Notice | null>(null);

  async function load() {
    setLoading(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/store-waitlists", { cache: "no-store" });
      const result = await response.json() as { records?: RecordRow[]; products?: ProductRow[]; error?: string };
      if (!response.ok) throw new Error(result.error || "Could not load Store waitlists.");
      setRecords(Array.isArray(result.records) ? result.records : []);
      setProducts(Array.isArray(result.products) ? result.products : []);
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Could not load Store waitlists." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [refreshKey]);

  const counts = useMemo(() => ({
    total: records.length,
    eligible: records.filter(canEmail).filter((record) => !record.data.waitlistLastNotifiedAt).length,
    notified: records.filter((record) => Boolean(record.data.waitlistLastNotifiedAt)).length,
    needsConsent: records.filter((record) => record.data.waitlistEmailConsent !== true && !record.data.waitlistUnsubscribedAt).length,
  }), [records]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return records.filter((record) => {
      const productId = value(record.data.resolvedProductId || record.data.storeProductId);
      if (selectedProduct !== "all" && productId !== selectedProduct) return false;
      if (!term) return true;
      return [record.data.name, record.data.email, record.data.phone, record.data.opportunityName, record.data.resolvedProductTitle, record.data.message]
        .map(value).join(" ").toLowerCase().includes(term);
    });
  }, [records, search, selectedProduct]);

  const productCounts = useMemo(() => {
    const map = new Map<string, number>();
    records.forEach((record) => {
      const id = value(record.data.resolvedProductId || record.data.storeProductId);
      if (id) map.set(id, (map.get(id) || 0) + 1);
    });
    return map;
  }, [records]);

  const selected = products.find((product) => product.id === selectedProduct) ?? null;
  const selectedRows = selected ? records.filter((record) => value(record.data.resolvedProductId || record.data.storeProductId) === selected.id) : [];
  const selectedEligible = selectedRows.filter((record) => canEmail(record) && !record.data.waitlistLastNotifiedAt);
  const productAvailable = Boolean(selected && selected.status === "active" && selected.data.availability === "available");

  async function updateRecord(record: RecordRow, action: "contacted" | "waiting") {
    setBusyId(record.id);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/store-waitlists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: record.id, action }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not update this waitlist entry.");
      await load();
      setNotice({ tone: "success", text: action === "contacted" ? "Marked as contacted." : "Moved back to waiting." });
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Could not update this waitlist entry." });
    } finally {
      setBusyId("");
    }
  }

  async function removeRecord(record: RecordRow) {
    const email = value(record.data.email);
    if (!window.confirm("Permanently remove the waitlist entry for " + email + "? This cannot be undone.")) return;
    setBusyId(record.id);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/store-waitlists", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: record.id }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not remove this waitlist entry.");
      await load();
      setNotice({ tone: "success", text: "Waitlist entry removed." });
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Could not remove this waitlist entry." });
    } finally {
      setBusyId("");
    }
  }

  function exportCsv() {
    const header = ["Product", "Name", "Email", "Phone", "Joined", "Email update consent", "Waitlist status", "Last notified"];
    const rows = visible.map((record) => [
      value(record.data.resolvedProductTitle || record.data.opportunityName),
      value(record.data.name),
      value(record.data.email),
      value(record.data.phone),
      record.created_at,
      canEmail(record) ? "Yes" : record.data.waitlistUnsubscribedAt ? "Unsubscribed" : "Not recorded",
      stateLabel(record),
      value(record.data.waitlistLastNotifiedAt),
    ]);
    const contents = [header, ...rows].map((row) => row.map(csv).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + contents], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "africa-plug-store-waitlist.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function notifyWaitlist() {
    if (!selected || !productAvailable) return;
    const count = selectedEligible.length;
    if (!count) {
      setNotice({ tone: "error", text: "There are no new, opted-in members to notify for this product." });
      return;
    }
    const confirmed = window.confirm("Send the availability email for " + selected.title + " to " + count + " opted-in waitlist member(s)? This will not email general newsletter subscribers or other product waitlists.");
    if (!confirmed) return;
    setSending(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/store-waitlists/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selected.id }),
      });
      const result = await response.json() as { ok?: boolean; sent?: number; message?: string; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "The notification campaign could not be sent.");
      await load();
      setNotice({ tone: "success", text: result.sent ? "Availability email sent to " + result.sent + " opted-in address(es) for " + selected.title + "." : result.message || "No new opted-in waitlist members to notify." });
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "The notification campaign could not be sent." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="apm apw">
      <div className="apm-head">
        <div>
          <p className="apm-eyebrow">THE AFRICA PLUG · STORE OPERATIONS</p>
          <h1>Store waitlists.</h1>
          <p>Manage product-specific launch audiences. Only people who explicitly opted in for that product receive its availability email.</p>
        </div>
        <div className="apm-head-actions">
          <Link className="apm-btn" href="/admin/store">Manage products ↗</Link>
          <button type="button" className="apm-btn" onClick={() => setRefreshKey((current) => current + 1)} disabled={loading || sending}>Refresh</button>
        </div>
      </div>

      {notice ? <p role="status" className={"apm-notice is-" + notice.tone}>{notice.text}</p> : null}

      <div className="apm-stats">
        <div className="apm-stat"><small>Total waitlist entries</small><strong>{loading ? "…" : counts.total}</strong></div>
        <div className="apm-stat"><small>Eligible for next email</small><strong>{loading ? "…" : counts.eligible}</strong></div>
        <div className="apm-stat"><small>Already notified</small><strong>{loading ? "…" : counts.notified}</strong></div>
        <div className="apm-stat"><small>Consent not recorded</small><strong>{loading ? "…" : counts.needsConsent}</strong></div>
      </div>

      <section className="apm-card apw-products">
        <div className="apm-panel-head">
          <div><h2>Product audiences</h2><p className="apm-muted">Each waitlist is kept separate from every other product and from the newsletter.</p></div>
        </div>
        {products.length ? <div className="apw-product-grid">
          {products.map((product) => {
            const count = productCounts.get(product.id) || 0;
            const activeCount = records.filter((record) => value(record.data.resolvedProductId || record.data.storeProductId) === product.id && canEmail(record) && !record.data.waitlistLastNotifiedAt).length;
            return <button type="button" key={product.id} className={"apw-product-card" + (selectedProduct === product.id ? " is-active" : "")} onClick={() => setSelectedProduct(product.id)}>
              <span className="apw-product-type">{value(product.data.productType) || "Product"} · {product.data.availability === "available" ? "Available" : "Coming soon"}</span>
              <strong>{product.title}</strong>
              <span>{count} registration(s) · {activeCount} eligible for next email</span>
            </button>;
          })}
        </div> : <p className="apm-muted">No Store products have been created yet.</p>}
      </section>

      <section className="apw-list-section">
        <div className="apm-toolbar">
          <label className="apw-filter">Product audience
            <select className="apm-input" value={selectedProduct} onChange={(event) => setSelectedProduct(event.target.value)}>
              <option value="all">All products</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.title}</option>)}
            </select>
          </label>
          <label className="apm-search">Search name, email or phone
            <input className="apm-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search waitlist…" />
          </label>
          <button type="button" className="apm-btn" onClick={exportCsv} disabled={!visible.length}>Export CSV</button>
          {selected ? <button type="button" className="apm-btn apm-btn-primary" onClick={() => void notifyWaitlist()} disabled={sending || loading || !productAvailable || !selectedEligible.length}>
            {sending ? "Sending…" : "Notify waitlist (" + selectedEligible.length + ")"}
          </button> : null}
        </div>

        {selected && !productAvailable ? <p className="apm-warn">To send the launch email, first open Store Products, set this product to Available, and save it. No other product audience will be included.</p> : null}
        {selected && productAvailable ? <p className="apw-send-note">The next notification will go only to {selectedEligible.length} new, opted-in email address(es) for <strong>{selected.title}</strong>. Newsletter subscribers and other product waitlists are excluded.</p> : null}

        <div className="apw-list-head"><div><h2>{selected ? selected.title : "All product waitlists"}</h2><p className="apm-muted">{loading ? "Loading registrations…" : visible.length + " registration(s) shown"}</p></div></div>

        {loading ? <div className="apm-card apm-empty">Loading Store waitlists…</div> : visible.length ? <div className="apw-record-list">
          {visible.map((record) => {
            const email = value(record.data.email);
            const optedIn = canEmail(record);
            const status = stateLabel(record);
            const busy = busyId === record.id;
            return <article className="apm-card apw-record" key={record.id}>
              <div className="apw-record-main">
                <div className="apw-record-identity">
                  <span className={"apm-tag " + (optedIn ? "is-ok" : status === "Unsubscribed" ? "is-neutral" : "is-warn")}>{optedIn ? "Email opted in" : status === "Unsubscribed" ? "Unsubscribed" : "Consent not recorded"}</span>
                  <h3>{value(record.data.name) || "Name not provided"}</h3>
                  <a href={"mailto:" + email}>{email || "Email not recorded"}</a>
                  <p>{value(record.data.phone) || "No phone number"} · Joined {date(record.created_at)}</p>
                </div>
                <div className="apw-record-product">
                  <small>PRODUCT</small>
                  <strong>{value(record.data.resolvedProductTitle || record.data.opportunityName) || "Unlinked product"}</strong>
                  <span className="apm-tag is-neutral">{status}</span>
                  {record.data.waitlistLastNotifiedAt ? <small>Last notified {date(value(record.data.waitlistLastNotifiedAt))}</small> : null}
                </div>
              </div>
              {record.data.message ? <details className="apm-details"><summary>View visitor message</summary><p className="apm-pre">{value(record.data.message)}</p></details> : null}
              <div className="apw-record-actions">
                {record.data.waitlistLastNotifiedAt ? null : <button type="button" className="apm-btn" disabled={busy} onClick={() => void updateRecord(record, status === "Contacted" ? "waiting" : "contacted")}>{busy ? "Saving…" : status === "Contacted" ? "Move to waiting" : "Mark contacted"}</button>}
                <button type="button" className="apm-btn apm-btn-danger" disabled={busy} onClick={() => void removeRecord(record)}>{busy ? "Working…" : "Remove entry"}</button>
              </div>
            </article>;
          })}
        </div> : <div className="apm-card apm-empty">{records.length ? "No registrations match this product and search." : "No one has joined a Store waitlist yet. New registrations will appear here automatically."}</div>}
      </section>
    </div>
  );
}
