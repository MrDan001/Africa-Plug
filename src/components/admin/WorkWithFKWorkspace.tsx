"use client";

import { useMemo, useState } from "react";
import "./WorkWithFKWorkspace.css";

type Application = {
  id: string; module: string; title: string; slug: string | null; status: string;
  data: Record<string, unknown>; created_at: string; updated_at: string;
};
const value = (input: unknown) => typeof input === "string" || typeof input === "number" ? String(input) : "";
const dateLabel = (input: string) => { const d = new Date(input); return Number.isNaN(d.getTime()) ? input : d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }); };
const paymentState = (record: Application) => {
  const status = value(record.data.paymentStatus);
  if (status === "confirmed") return "paid";
  if (status === "link_sent") return "sent";
  if (status === "email_failed") return "failed";
  if (status === "expired") return "expired";
  return "pending";
};
const paymentLabel: Record<string,string> = { pending:"Pending", sent:"Link sent", paid:"Paid", failed:"Email failed", expired:"Link expired" };
const tone: Record<string,string> = { pending:"pending", sent:"sent", paid:"paid", failed:"failed", expired:"expired" };

export default function WorkWithFKWorkspace({ records, loading, onRefresh, onDecision }: {
  records: Application[]; loading: boolean; onRefresh: () => void;
  onDecision: (record: Application, status: string) => Promise<void>;
}) {
  const [selectedId,setSelectedId] = useState("");
  const [query,setQuery] = useState("");
  const [filter,setFilter] = useState("all");
  const [busy,setBusy] = useState("");
  const [message,setMessage] = useState("");
  const selected = records.find(r=>r.id===selectedId) ?? null;
  const visible = useMemo(()=>records.filter(r=>{
    const haystack=[r.title,value(r.data.fullName)||value(r.data.name),value(r.data.email),value(r.data.company)||value(r.data.organisation)||value(r.data.organization),value(r.data.goal),value(r.data.obstacle)].join(" ").toLowerCase();
    return (!query.trim()||haystack.includes(query.trim().toLowerCase())) && (filter==="all"||paymentState(r)===filter);
  }),[records,query,filter]);
  const stats = useMemo(()=>({
    total:records.length, pending:records.filter(r=>paymentState(r)==="pending").length,
    sent:records.filter(r=>paymentState(r)==="sent").length, paid:records.filter(r=>paymentState(r)==="paid").length,
    failed:records.filter(r=>paymentState(r)==="failed").length
  }),[records]);
  async function paymentAction(record:Application, action:"create"|"resend") {
    setBusy(record.id); setMessage("");
    try {
      const response=await fetch("/api/work-with-fk/deal-diagnostic/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:record.id,action})});
      const result=await response.json() as {error?:string;url?:string;emailNotification?:string;message?:string};
      if(!response.ok||!result.url) throw new Error(result.error||"Could not create the payment link.");
      try { await navigator.clipboard.writeText(result.url); } catch {}
      setMessage(result.emailNotification==="sent" ? "Payment link emailed successfully. The application status has been updated." : result.emailNotification==="failed" ? "Payment link created, but the email failed. The link was copied so you can share it manually." : "Payment link created, but email sending is not configured. The link was copied.");
      onRefresh();
    } catch(e) { setMessage(e instanceof Error?e.message:"Could not send the payment link."); }
    finally { setBusy(""); }
  }
  function exportCsv() {
    const quote=(v:unknown)=>'"'+value(v).replace(/"/g,'""')+'"';
    const rows=[["Applicant","Email","Company","Application status","Payment status","Submitted"],...visible.map(r=>[value(r.data.fullName)||value(r.data.name)||r.title,value(r.data.email),value(r.data.company)||value(r.data.organisation)||value(r.data.organization),r.status,paymentLabel[paymentState(r)],r.created_at])];
    const blob=new Blob(["\uFEFF"+rows.map(row=>row.map(quote).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="the-africa-plug-work-with-fk.csv"; a.click(); URL.revokeObjectURL(url);
  }
  return <div className="apm apm-wfk">
    <header className="apm-wfk-heading"><div><span className="apm-eyebrow">BUSINESS OPERATIONS</span><h1>Work With FK</h1><p>Review applications, send Deal Diagnostic payment links and track every payment.</p></div><div className="apm-head-actions"><button className="apm-btn" type="button" onClick={onRefresh}>↻ Refresh</button><button className="apm-btn apm-btn-primary" type="button" onClick={exportCsv}>↓ Export applications</button></div></header>
    <div className="apm-wfk-stats">
      <div><small>Total applications</small><strong>{stats.total}</strong><span>All submissions</span></div>
      <div className="is-pending"><small>Pending payment</small><strong>{stats.pending}</strong><span>Awaiting action</span></div>
      <div className="is-sent"><small>Links sent</small><strong>{stats.sent}</strong><span>Emails dispatched</span></div>
      <div className="is-paid"><small>Paid</small><strong>{stats.paid}</strong><span>Completed deals</span></div>
      <div className="is-failed"><small>Email failures</small><strong>{stats.failed}</strong><span>Needs attention</span></div>
    </div>
    <div className="apm-wfk-layout">
      <section className="apm-card apm-wfk-inbox">
        <div className="apm-wfk-tools"><input className="apm-input" type="search" placeholder="Search name, email or company…" value={query} onChange={e=>setQuery(e.target.value)} aria-label="Search applications"/><select className="apm-input" value={filter} onChange={e=>setFilter(e.target.value)} aria-label="Filter payment status"><option value="all">All payment statuses</option><option value="pending">Pending</option><option value="sent">Link sent</option><option value="paid">Paid</option><option value="failed">Email failed</option><option value="expired">Expired</option></select></div>
        <div className="apm-wfk-tabs">{["all","pending","sent","paid","failed"].map(s=><button type="button" key={s} className={filter===s?"is-active":""} onClick={()=>setFilter(s)}>{s==="all"?"All applications":paymentLabel[s]||s}</button>)}</div>
        {loading?<div className="apm-empty">Loading applications…</div>:visible.length?<div className="apm-wfk-list">{visible.map(r=>{
          const name=value(r.data.fullName)||value(r.data.name)||r.title||"Applicant"; const state=paymentState(r);
          return <button type="button" key={r.id} className={"apm-wfk-row"+(selectedId===r.id?" is-selected":"")} onClick={()=>{setSelectedId(r.id);setMessage("");}}>
            <span className="apm-wfk-avatar">{name.trim().slice(0,2).toUpperCase()}</span><span className="apm-wfk-copy"><strong>{name}</strong><small>{value(r.data.company)||value(r.data.organisation)||value(r.data.organization)||"Company not supplied"}</small><span>{value(r.data.email)}</span></span><span className="apm-wfk-row-meta"><i className={"apm-wfk-status is-"+tone[state]}>{paymentLabel[state]}</i><small>{dateLabel(r.created_at)}</small></span>
          </button>;
        })}</div>:<div className="apm-empty">{records.length?"No applications match this filter.":"No applications have been submitted yet."}</div>}
        <footer className="apm-wfk-foot">Showing {visible.length} of {records.length} applications</footer>
      </section>
      <aside className="apm-card apm-wfk-detail">
        {selected?<><div className="apm-wfk-detail-head"><div><span className="apm-eyebrow">APPLICATION DETAILS</span><h2>{value(selected.data.fullName)||value(selected.data.name)||selected.title}</h2><p>{value(selected.data.company)||value(selected.data.organisation)||value(selected.data.organization)||"Organisation not supplied"}</p></div><button className="apm-wfk-close" type="button" onClick={()=>setSelectedId("")} aria-label="Close details">×</button></div>
          <div className="apm-wfk-badges"><span className={"apm-wfk-status is-"+tone[paymentState(selected)]}>{paymentLabel[paymentState(selected)]}</span><span className="apm-wfk-app-status">Application: {selected.status.replace(/-/g," ")}</span></div>
          <div className="apm-wfk-section"><h3>Applicant information</h3><dl>{[["Email",value(selected.data.email)],["Phone",value(selected.data.phone)],["Company",value(selected.data.company)||value(selected.data.organisation)||value(selected.data.organization)],["Country",value(selected.data.country)],["Markets",value(selected.data.markets)],["Submitted",dateLabel(selected.created_at)]].filter(x=>x[1]).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div>
          <div className="apm-wfk-section"><h3>What they want to achieve</h3><p>{value(selected.data.goal)||value(selected.data.mandate)||value(selected.data.message)||value(selected.data.objective)||"No mandate was supplied."}</p>{value(selected.data.obstacle)?<><h3 className="apm-wfk-subhead">Main obstacle</h3><p>{value(selected.data.obstacle)}</p></>:null}</div>
          <div className="apm-wfk-payment"><h3>Deal Diagnostic · £2,500</h3><div className="apm-wfk-payment-line"><span>Payment status</span><strong>{paymentLabel[paymentState(selected)]}</strong></div>{value(selected.data.paymentLinkSentAt)?<div className="apm-wfk-payment-line"><span>Last email sent</span><strong>{dateLabel(value(selected.data.paymentLinkSentAt))}</strong></div>:null}{value(selected.data.paymentPaidAt)?<div className="apm-wfk-payment-line"><span>Paid at</span><strong>{dateLabel(value(selected.data.paymentPaidAt))}</strong></div>:null}
            {value(selected.data.paymentCheckoutUrl)?<a className="apm-btn apm-wfk-copy" href={value(selected.data.paymentCheckoutUrl)} target="_blank" rel="noreferrer">Open current Stripe link ↗</a>:null}
            {selected.status==="approved"&&paymentState(selected)!=="paid"?<button type="button" className="apm-btn apm-btn-primary apm-wfk-send" disabled={!!busy} onClick={()=>void paymentAction(selected,paymentState(selected)==="pending"?"create":"resend")}>{busy===selected.id?"Sending…":paymentState(selected)==="pending"?"Generate & send payment link":"Resend payment link"}</button>:null}
            {selected.status==="approved"&&paymentState(selected)!=="paid"?<p className="apm-wfk-hint">Approval is complete. You can now generate or resend the separate payment link below.</p>:null}
          </div>
          <div className="apm-wfk-timeline"><h3>Application & payment activity</h3>{value(selected.data.decisionEmailSentAt)?<div><i className="is-done"/><span><strong>{selected.data.decisionEmailType==="approved"?"Approval email sent":"Decline email sent"}</strong><small>{dateLabel(value(selected.data.decisionEmailSentAt))}</small></span></div>:null}<div><i className="is-done"/> <span><strong>Application received</strong><small>{dateLabel(selected.created_at)}</small></span></div>{value(selected.data.paymentLinkCreatedAt)?<div><i className="is-done"/><span><strong>Payment link generated</strong><small>{dateLabel(value(selected.data.paymentLinkCreatedAt))}</small></span></div>:null}{value(selected.data.paymentLinkSentAt)?<div><i className="is-done"/><span><strong>Payment email sent</strong><small>{dateLabel(value(selected.data.paymentLinkSentAt))}</small></span></div>:null}{paymentState(selected)==="failed"?<div><i className="is-failed"/><span><strong>Email delivery failed</strong><small>Retry sending the payment link.</small></span></div>:null}{paymentState(selected)==="paid"?<div><i className="is-done"/><span><strong>Payment received</strong><small>{value(selected.data.paymentPaidAt)?dateLabel(value(selected.data.paymentPaidAt)):"Confirmed by Stripe"}</small></span></div>:<div><i/><span><strong>Awaiting applicant payment</strong><small>Payment status updates automatically through Stripe.</small></span></div>}</div>
          {message?<p className="apm-wfk-feedback" role="status">{message}</p>:null}
          {selected.status==="review-required"||["pending","submitted","new"].includes(selected.status)?<section className="apm-wfk-decision"><div><h3>Application decision</h3><p>Send the applicant an approval or decline email. Payment is handled separately after approval.</p></div><div className="apm-wfk-actions"><button className="apm-btn apm-btn-ok" type="button" disabled={!!busy} onClick={()=>void onDecision(selected,"approved")}>{busy===selected.id?"Processing…":"Approve & email applicant"}</button><button className="apm-btn apm-btn-danger" type="button" disabled={!!busy} onClick={()=>void onDecision(selected,"declined")}>Decline & email applicant</button></div></section>:null}
        </>:<div className="apm-enq-placeholder"><span>↗</span><h2>Select an application</h2><p>Choose an applicant to review their details, issue a payment link and follow payment progress.</p></div>}
      </aside>
    </div>
  </div>;
}
