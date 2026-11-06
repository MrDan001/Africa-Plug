"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Kind = "contact" | "ask" | "partner" | "interest" | "work";
const config: Record<Kind, { title: string; description: string; button: string; endpoint: string }> = {
  contact: { title: "Send an enquiry", description: "Share a few details and your message will be sent to The Africa Plug team.", button: "SEND ENQUIRY", endpoint: "/api/forms/contact" },
  ask: { title: "Ask The Africa Plug", description: "What would you like to know? Give us enough context to point you in the right direction.", button: "SEND YOUR QUESTION", endpoint: "/api/forms/ask" },
  partner: { title: "Partner with TAP", description: "Tell us about your organisation and the kind of partnership you have in mind.", button: "SEND PARTNERSHIP ENQUIRY", endpoint: "/api/forms/partner" },
  interest: { title: "Express interest", description: "Tell us how you may be able to contribute to this opportunity.", button: "SEND EXPRESSION OF INTEREST", endpoint: "/api/forms/interest" },
  work: { title: "Tell us about your brief", description: "Share your commercial objective and the support you are looking for. This is an initial enquiry, not an engagement or payment confirmation.", button: "SEND YOUR BRIEF", endpoint: "/api/work-with-fk/apply" },
};

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        "expired-callback"?: () => void;
        "error-callback"?: () => void;
        theme?: "dark" | "light" | "auto";
      }) => string;
      remove: (id: string) => void;
    };
  }
}

export default function EnquiryForm({ kind = "contact", opportunityName, modal = false, defaultArea = "", storeEnquiryTitle, storeWaitlist = false, storeProductId = "", storeProductSlug = "" }: { kind?: Kind; opportunityName?: string; modal?: boolean; defaultArea?: string; storeEnquiryTitle?: string; storeWaitlist?: boolean; storeProductId?: string; storeProductSlug?: string }) {
  const form = config[kind];
  const publicReplyEmail = kind === "ask" ? "ask@theafricaplug.com" : "connect@theafricaplug.com";
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const applicationStarted = useRef(false);

  function markStarted() {
    if (kind !== "work" || applicationStarted.current) return;
    applicationStarted.current = true;
    void fetch("/api/analytics/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventName: "application_started", path: window.location.pathname, source: new URLSearchParams(window.location.search).get("utm_source") || document.referrer || "direct", referrer: document.referrer, utm: Object.fromEntries(["utm_source","utm_medium","utm_campaign","utm_content","utm_term"].map((key) => [key, new URLSearchParams(window.location.search).get(key) || ""])) }) }).catch(() => undefined);
  }

  useEffect(() => {
    if (!siteKey || !widgetRef.current) return;
    let cancelled = false;
    let script = document.getElementById("cloudflare-turnstile-script") as HTMLScriptElement | null;
    const render = () => {
      if (cancelled || !window.turnstile || !widgetRef.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(widgetRef.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: setToken,
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
      });
    };
    if (window.turnstile) render();
    else {
      if (!script) {
        script = document.createElement("script");
        script.id = "cloudflare-turnstile-script";
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
      }
      script.addEventListener("load", render);
      if (!script.isConnected) document.head.appendChild(script);
    }
    return () => {
      cancelled = true;
      script?.removeEventListener("load", render);
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice(null);
    const currentForm = event.currentTarget;
    const data: Record<string, FormDataEntryValue | string> = Object.fromEntries(new FormData(currentForm).entries());
    data.turnstileToken = token;
    if (opportunityName) data.opportunityName = opportunityName;

    try {
      const response = await fetch(form.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        setNotice({ ok: false, text: result.error || "We couldn't send your enquiry. Please try again." });
        return;
      }
      currentForm.reset();
      setToken("");
      setNotice({ ok: true, text: storeWaitlist ? "Thank you. You are on the waitlist and we will be in touch when this guide is ready." : storeEnquiryTitle ? "Thank you. We'll be in touch soon." : kind === "partner" ? "Thank you. We'll be in touch if it's a fit." : kind === "ask" ? "Thanks, we review every question and may select yours for research, content or follow up." : kind === "interest" && opportunityName ? `Thanks, The Africa Plug has received your expression of interest in ${opportunityName}.` : kind === "work" ? "Thanks. Your application has been received for review. This is not an approval or payment confirmation." : "Thank you. Your enquiry has been sent to The Africa Plug." });
    } catch {
      setNotice({ ok: false, text: `We couldn't connect to the form service. Please email ${publicReplyEmail} directly.` });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={`enquiry-panel${modal ? " enquiry-panel-modal" : ""}`}>
      <header className="enquiry-panel-heading">
        <p className="standard-eyebrow">THE AFRICA PLUG</p>
        <h2>{storeWaitlist ? `Join the waitlist for ${storeEnquiryTitle}` : storeEnquiryTitle ? `Enquire about ${storeEnquiryTitle}` : form.title}</h2>
        <p>{storeWaitlist ? "Leave your details and we will let you know when this guide is ready." : storeEnquiryTitle ? "Send FK a few details and she will follow up by email." : form.description}</p>
      </header>
      <form className="enquiry-form" onSubmit={submit} onFocusCapture={markStarted}>
        <div className="enquiry-form-grid">
          <label><span>Your name <b>*</b></span><input name="name" autoComplete="name" required minLength={2} maxLength={120} /></label>
          <label><span>Email address <b>*</b></span><input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
          {!storeEnquiryTitle ? <label><span>Organisation <small>Optional</small></span><input name="organisation" autoComplete="organization" maxLength={160} /></label> : null}
          <label><span>{storeEnquiryTitle ? "Phone or WhatsApp" : "Phone"} <small>Optional</small></span><input name="phone" type="tel" autoComplete="tel" maxLength={50} /></label>
          {storeEnquiryTitle ? <><input type="hidden" name="enquiryType" value={storeWaitlist ? "Store waitlist" : "Store enquiry"} /><input type="hidden" name="storeProductId" value={storeProductId} /><input type="hidden" name="storeProductSlug" value={storeProductSlug} /></> : null}
          {kind === "contact" ? <label className="enquiry-full-width">
            <span>What is this about? <b>*</b></span>
            <select
              name="enquiryType"
              defaultValue="General enquiry"
              required
              onChange={(event) => {
                const selected = event.currentTarget.value;
                if (selected === "Ask The Africa Plug") window.location.assign("/contact?type=ask");
                if (selected === "Partnership") window.location.assign("/contact?type=partner");
              }}
            >
              <option>General enquiry</option>
              <option>Ask The Africa Plug</option>
              <option>Partnership</option>
              <option>T.A.P IN opportunity</option>
              <option>Store order or service</option>
            </select>
          </label> : kind === "partner" ? <label className="enquiry-full-width">
            <span>Partnership area <b>*</b></span>
            <select name="enquiryType" defaultValue={defaultArea} required>
              <option value="" disabled>Select a partnership area</option>
              <option>Sponsorship</option>
              <option>Brand partnership</option>
              <option>Interview / guest</option>
              <option>Event</option>
              <option>Hosting / moderation</option>
              <option>Tourism</option>
              <option>Institutional</option>
              <option>Content collaboration</option>
              <option>Plug Us In</option>
              <option>Article pitch</option>
              <option>Other</option>
            </select>
          </label> : kind === "work" ? <>
            <label><span>Country / market <b>*</b></span><input name="countryMarket" required maxLength={200} placeholder="Which market or markets?" /></label>
            <label><span>Your role <b>*</b></span><input name="role" required maxLength={120} placeholder="Your role in the organisation" /></label>
            <label className="enquiry-full-width"><span>Project / mandate <b>*</b></span><textarea name="projectMandate" required minLength={10} maxLength={2000} rows={4} placeholder="What are you trying to assess, develop or progress?" /></label>
            <label><span>Timeframe <b>*</b></span><input name="timeframe" required maxLength={120} placeholder="e.g. next quarter" /></label>
            <label><span>Budget range <small>Optional at this stage</small></span><input name="budgetRange" maxLength={120} placeholder="Range and currency, if known" /></label>
          </> : storeEnquiryTitle ? null : null}
          {opportunityName || storeEnquiryTitle ? <input type="hidden" name="opportunityName" value={storeEnquiryTitle || opportunityName} /> : null}
          <label className="enquiry-full-width"><span>Your message <b>*</b></span><textarea name="message" rows={5} required minLength={10} maxLength={5000} placeholder="Tell us a little about your enquiry…" /></label>
        </div>
        {kind === "partner" || storeEnquiryTitle ? <label className="enquiry-consent"><input type="checkbox" name="consent" value="true" required /> <span>I agree to the <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a> and <a href="/terms" target="_blank" rel="noreferrer">Terms</a>.</span></label> : null}
        {storeWaitlist ? <label className="enquiry-consent"><input type="checkbox" name="waitlistEmailConsent" value="true" required /> <span>Email me when this specific product is available. I can unsubscribe at any time.</span></label> : null}
        {storeWaitlist ? <p className="enquiry-privacy-note">This only signs you up for updates about this product. It does not subscribe you to the general newsletter or other product lists.</p> : null}
        <label className="enquiry-honeypot" aria-hidden="true">Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
        {siteKey ? <div className="enquiry-security"><div ref={widgetRef} /><small>Complete the security check before submitting.</small></div> : null}
        {notice ? <p className={`enquiry-status ${notice.ok ? "success" : "error"}`} role="status" aria-live="polite">{notice.text}{!notice.ok ? <>{" "}Email <a href={`mailto:${publicReplyEmail}`}>{publicReplyEmail}</a> if you need another route.</> : null}</p> : null}
        <div className="enquiry-submit-row">
          <button className="standard-button" type="submit" disabled={busy || Boolean(siteKey && !token)}>{busy ? "SENDING…" : storeWaitlist ? "JOIN WAITLIST" : storeEnquiryTitle ? "SEND ENQUIRY" : form.button}<span aria-hidden="true">→</span></button>
          <p>Or email <a href={`mailto:${publicReplyEmail}`}>{publicReplyEmail}</a> directly.</p>
        </div>
        <p className="enquiry-privacy-note">Please do not include passwords, payment card details or other sensitive information.</p>
      </form>
    </section>
  );
}
