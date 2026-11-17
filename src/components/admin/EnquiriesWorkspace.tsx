"use client";

import { useMemo, useState } from "react";
import "./EnquiriesWorkspace.css";

type Enquiry = {
  id: string;
  module: string;
  title: string;
  slug: string | null;
  status: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

const STAT_ICONS = {
  mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7.5 8 6 8-6" /></>,
  inbox: <><path d="M4 13.5 6.7 6a1.5 1.5 0 0 1 1.4-1h7.8a1.5 1.5 0 0 1 1.4 1L20 13.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /><path d="M4 13.5h4.6l1 2.2h4.8l1-2.2H20" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12.4 2.8 2.8L16.4 9.4" /></>,
} as const;

function StatIcon({ name, className, size = 27, width = 1.8 }: { name: keyof typeof STAT_ICONS; className?: string; size?: number; width?: number }) {
  return <svg className={className} viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{STAT_ICONS[name]}</svg>;
}

function value(input: unknown) {
  return typeof input === "string" || typeof input === "number" ? String(input) : "";
}

function labelFor(record: Enquiry) {
  return value(record.data.enquiryType) || value(record.data.formType) || (value(record.data.kind) === "partner" ? "Partnership" : "Website enquiry");
}

function statusTone(status: string) {
  if (status === "resolved") return "resolved";
  if (status === "in-progress" || status === "awaiting-response") return "working";
  return "new";
}

function dateLabel(input: string) {
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? input : date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

export default function EnquiriesWorkspace({ records, loading, onStatus, onRefresh }: {
  records: Enquiry[];
  loading: boolean;
  onStatus: (record: Enquiry, status: string) => Promise<void>;
  onRefresh: () => void;
}) {
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formFilter, setFormFilter] = useState("all");
  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selected = records.find((record) => record.id === selectedId) ?? null;
  const categories = useMemo(() => Array.from(new Set(records.map(labelFor))).sort(), [records]);
  const visible = useMemo(() => records.filter((record) => {
    const haystack = [record.title, value(record.data.name), value(record.data.email), value(record.data.message), labelFor(record)].join(" ").toLowerCase();
    return (!query.trim() || haystack.includes(query.trim().toLowerCase()))
      && (statusFilter === "all" || record.status === statusFilter)
      && (formFilter === "all" || labelFor(record) === formFilter);
  }), [records, query, statusFilter, formFilter]);

  const newCount = records.filter((record) => ["new", "pending", "submitted", "review-required"].includes(record.status)).length;
  const activeCount = records.filter((record) => ["in-progress", "awaiting-response"].includes(record.status)).length;
  const resolvedCount = records.filter((record) => record.status === "resolved").length;
  const share = (count: number) => (records.length ? Math.round((count / records.length) * 100) : 0);

  async function saveInternalDetails() {
    if (!selected) return;
    setSaving(true);
    setMessage("");
    const notes = Array.isArray(selected.data.internalNotes) ? selected.data.internalNotes as Array<{ text: string; createdAt: string }> : [];
    const nextNotes = note.trim() ? [...notes, { text: note.trim(), createdAt: new Date().toISOString() }] : notes;
    try {
      const response = await fetch("/api/admin/cms/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          record: {
            id: selected.id,
            title: selected.title,
            slug: selected.slug,
            status: selected.status,
            data: { ...selected.data, internalNotes: nextNotes, followUpAt: followUp || null },
          },
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not save enquiry notes.");
      setNote("");
      setMessage("Enquiry notes and follow-up saved.");
      onRefresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save enquiry notes.");
    } finally {
      setSaving(false);
    }
  }

  function exportEnquiries() {
    const quote = (input: unknown) => '"' + value(input).replace(/"/g, '""') + '"';
    const rows = [["Name", "Email", "Form", "Status", "Submitted", "Message"], ...visible.map((record) => [
      value(record.data.name) || record.title, value(record.data.email), labelFor(record), record.status, record.created_at, value(record.data.message),
    ])];
    const blob = new Blob(["\uFEFF" + rows.map((row) => row.map(quote).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "the-africa-plug-enquiries.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="apm apm-enquiries">
      <header className="apm-enq-heading">
        <div><span className="apm-eyebrow">BUSINESS OPERATIONS</span><h1>Enquiries &amp; Forms</h1><p>One place to review incoming messages, track follow-ups and manage website submissions.</p></div>
        <div className="apm-head-actions"><button type="button" className="apm-btn" onClick={onRefresh}>↻ Refresh</button><button type="button" className="apm-btn apm-btn-primary" onClick={exportEnquiries}>↓ Export CSV</button></div>
      </header>

      <div className="apm-enq-stats">
        <div className="apm-enq-stat is-total">
          <StatIcon name="mail" className="apm-enq-mark" size={104} width={1.6} />
          <span className="apm-enq-stat-icon"><StatIcon name="mail" /></span>
          <div className="apm-enq-stat-body"><small>Total enquiries</small><strong>{records.length}</strong><em>Every message received</em></div>
          <div>
            <div className="apm-enq-split" aria-hidden="true"><i style={{ width: `${share(newCount)}%` }} /><i style={{ width: `${share(activeCount)}%` }} /><i style={{ width: `${share(resolvedCount)}%` }} /></div>
            <div className="apm-enq-legend"><span>● New</span><span>● Active</span><span>● Done</span></div>
          </div>
        </div>
        <div className="apm-enq-stat is-blue">
          <StatIcon name="inbox" className="apm-enq-mark" size={104} width={1.6} />
          <span className="apm-enq-stat-icon"><StatIcon name="inbox" /></span>
          <div className="apm-enq-stat-body"><small>New</small><strong>{newCount}</strong><em>Waiting for a reply</em></div>
          <div className="apm-enq-share"><div className="apm-enq-track"><i style={{ width: `${share(newCount)}%` }} /></div><b>{share(newCount)}%</b></div>
        </div>
        <div className="apm-enq-stat is-amber">
          <StatIcon name="clock" className="apm-enq-mark" size={104} width={1.6} />
          <span className="apm-enq-stat-icon"><StatIcon name="clock" /></span>
          <div className="apm-enq-stat-body"><small>In progress</small><strong>{activeCount}</strong><em>Being followed up</em></div>
          <div className="apm-enq-share"><div className="apm-enq-track"><i style={{ width: `${share(activeCount)}%` }} /></div><b>{share(activeCount)}%</b></div>
        </div>
        <div className="apm-enq-stat is-green">
          <StatIcon name="check" className="apm-enq-mark" size={104} width={1.6} />
          <span className="apm-enq-stat-icon"><StatIcon name="check" /></span>
          <div className="apm-enq-stat-body"><small>Resolved</small><strong>{resolvedCount}</strong><em>Closed out</em></div>
          <div className="apm-enq-share"><div className="apm-enq-track"><i style={{ width: `${share(resolvedCount)}%` }} /></div><b>{share(resolvedCount)}%</b></div>
        </div>
      </div>

      <div className="apm-enq-layout">
        <section className="apm-card apm-enq-inbox" aria-label="Enquiry inbox">
          <div className="apm-enq-tools">
            <input className="apm-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email or message…" aria-label="Search enquiries" />
            <select className="apm-input" value={formFilter} onChange={(event) => setFormFilter(event.target.value)} aria-label="Filter by form"><option value="all">All forms</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select>
            <select className="apm-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status"><option value="all">All statuses</option><option value="new">New</option><option value="in-progress">In progress</option><option value="awaiting-response">Awaiting response</option><option value="resolved">Resolved</option></select>
          </div>
          <div className="apm-enq-tabs">
            {["all", "new", "in-progress", "resolved"].map((status) => <button key={status} type="button" className={statusFilter === status ? "is-active" : ""} onClick={() => setStatusFilter(status)}>{status === "all" ? "All submissions" : status.replace("-", " ")}</button>)}
          </div>
          {loading ? <div className="apm-empty">Loading enquiries…</div> : visible.length ? <div className="apm-enq-list">
            {visible.map((record) => {
              const name = value(record.data.name) || record.title || "Website visitor";
              const email = value(record.data.email);
              const active = selectedId === record.id;
              return <button type="button" key={record.id} className={"apm-enq-row" + (active ? " is-selected" : "")} onClick={() => { setSelectedId(record.id); setNote(""); setFollowUp(value(record.data.followUpAt).slice(0, 16)); setMessage(""); }}>
                <span className="apm-enq-avatar">{name.trim().slice(0, 1).toUpperCase()}</span>
                <span className="apm-enq-row-copy"><strong>{name}</strong><small>{email || labelFor(record)}</small><span>{value(record.data.message) || "No message preview available."}</span></span>
                <span className="apm-enq-row-meta"><i className={"apm-enq-status is-" + statusTone(record.status)}>{record.status.replace(/-/g, " ")}</i><small>{dateLabel(record.created_at)}</small></span>
              </button>;
            })}
          </div> : <div className="apm-empty">{records.length ? "No enquiries match these filters." : "No enquiries have been submitted yet."}</div>}
          <footer className="apm-enq-list-foot">Showing {visible.length} of {records.length} submissions</footer>
        </section>

        <aside className="apm-card apm-enq-detail" aria-label="Enquiry details">
          {selected ? <>
            <div className="apm-enq-detail-head"><div><span className="apm-eyebrow">SUBMISSION DETAILS</span><h2>Enquiry details</h2></div><button type="button" className="apm-enq-close" onClick={() => setSelectedId("")} aria-label="Close details">×</button></div>
            <span className={"apm-enq-status is-" + statusTone(selected.status)}>{selected.status.replace(/-/g, " ")}</span>
            <h3>{value(selected.data.name) || selected.title}</h3>
            {value(selected.data.email) ? <a href={"mailto:" + encodeURIComponent(value(selected.data.email))}>{value(selected.data.email)}</a> : null}
            {value(selected.data.phone) ? <p>{value(selected.data.phone)}</p> : null}
            <div className="apm-enq-meta-grid"><div><small>Form type</small><strong>{labelFor(selected)}</strong></div><div><small>Submitted</small><strong>{dateLabel(selected.created_at)}</strong></div></div>
            <div className="apm-enq-message"><small>Message / submission</small><p>{value(selected.data.message) || "No message field was included in this submission."}</p></div>
            <div className="apm-enq-fields"><small>Other submitted details</small>{Object.entries(selected.data).filter(([key, input]) => input !== null && input !== "" && !["message", "name", "email", "phone", "turnstileToken", "website", "internalNotes", "followUpAt"].includes(key) && typeof input !== "object").map(([key, input]) => <div key={key}><span>{key.replace(/([A-Z])/g, " $1")}</span><strong>{String(input)}</strong></div>)}</div>
            <label className="apm-enq-label">Internal note<textarea className="apm-input apm-textarea" rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a note for your team. Only admins can see this." /></label>
            {Array.isArray(selected.data.internalNotes) && selected.data.internalNotes.length ? <div className="apm-enq-notes"><small>Previous notes</small>{(selected.data.internalNotes as Array<{ text: string; createdAt: string }>).map((item, index) => <p key={index}>{item.text}<small>{dateLabel(item.createdAt)}</small></p>)}</div> : null}
            <label className="apm-enq-label">Next follow-up<input className="apm-input" type="datetime-local" value={followUp} onChange={(event) => setFollowUp(event.target.value)} /></label>
            <label className="apm-enq-label">Update status<select className="apm-input" value={selected.status} onChange={(event) => void onStatus(selected, event.target.value)}><option value="new">New</option><option value="in-progress">In progress</option><option value="awaiting-response">Awaiting response</option><option value="resolved">Resolved</option></select></label>
            {message ? <p className="apm-enq-feedback" role="status">{message}</p> : null}
            <button type="button" className="apm-btn apm-btn-primary apm-enq-save" disabled={saving} onClick={() => void saveInternalDetails()}>{saving ? "Saving…" : "Save notes & follow-up"}</button>
            {value(selected.data.email) ? <a className="apm-btn apm-enq-mail" href={"mailto:" + encodeURIComponent(value(selected.data.email)) + "?subject=" + encodeURIComponent("Re: " + labelFor(selected))}>Open email reply ↗</a> : null}
          </> : <div className="apm-enq-placeholder"><span>✉</span><h2>Select an enquiry</h2><p>Choose a submission from the inbox to view its full details, add internal notes and plan a follow-up.</p></div>}
        </aside>
      </div>
    </div>
  );
}
