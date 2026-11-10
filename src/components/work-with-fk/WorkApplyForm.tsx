// FILE PATH: src/components/work-with-fk/WorkApplyForm.tsx
"use client";

import { useState, type FormEvent } from "react";
import { useTurnstile } from "./useTurnstile";
import { COUNTRIES, DEAL_STAGES, HEAR_ABOUT, TIMEFRAMES } from "@/lib/work-with-fk/application-schema";
import "./work-with-fk.css";

export default function WorkApplyForm() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const { widgetRef, token } = useTurnstile(siteKey);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [goalLength, setGoalLength] = useState(0);
  const [obstacleLength, setObstacleLength] = useState(0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const data: Record<string, unknown> = Object.fromEntries(formData.entries());
    data.consent = formData.get("consent") === "on";
    data.turnstileToken = token;
    try {
      const response = await fetch("/api/work-with-fk/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        setError(result.error || "We couldn’t send your application. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("We couldn’t connect to the form service. Please email connect@theafricaplug.com directly.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="wfk-success-wrap" role="dialog" aria-modal="true" aria-labelledby="wfk-success-title">
        <div className="wfk-success-overlay" aria-hidden="true" />
        <section className="wfk-success-modal" role="document">
          <button type="button" className="wfk-success-close" aria-label="Close" onClick={() => setDone(false)}>×</button>
          <div className="wfk-success-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 12.5 9.2 16.5 19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="wfk-success-kicker">APPLICATION RECEIVED</span>
          <h2 id="wfk-success-title">Thank you!</h2>
          <p>We’ll be in touch if it’s a fit.</p>
          <button type="button" className="wfk-btn wfk-btn-primary wfk-success-done" onClick={() => setDone(false)}>DONE<span aria-hidden="true">→</span></button>
        </section>
      </div>
    );
  }

  return (
    <section className="enquiry-panel wfk-form-panel">
      <form className="enquiry-form" onSubmit={submit}>
        <div className="enquiry-form-grid">
          <label><span>Full name <b>*</b></span><input name="fullName" autoComplete="name" required maxLength={120} /></label>
          <label><span>Role <b>*</b></span><input name="role" autoComplete="organization-title" required maxLength={120} /></label>
          <label><span>Company or organisation <b>*</b></span><input name="company" autoComplete="organization" required maxLength={160} /></label>
          <label><span>Email <b>*</b></span><input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
          <label>
            <span>Phone or WhatsApp <small>Optional</small></span>
            <input name="phone" type="tel" autoComplete="tel" maxLength={30} pattern="\+[0-9][0-9 ()\-]{5,28}" placeholder="+234 (0) 913 - XXX - XXXX" title="Include your country code, for example +234" />
          </label>
          <label>
            <span>Country you’re based in <b>*</b></span>
            <select name="country" defaultValue="" required>
              <option value="" disabled>Select a country</option>
              {COUNTRIES.map((country) => <option key={country} value={country}>{country}</option>)}
            </select>
          </label>
          <label className="enquiry-full-width"><span>Market or markets involved <b>*</b></span><input name="markets" required maxLength={200} /></label>
          <label>
            <span>Where is the deal now? <b>*</b></span>
            <select name="dealStage" defaultValue="" required>
              <option value="" disabled>Select one</option>
              {DEAL_STAGES.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
            </select>
          </label>
          <label>
            <span>Timeframe <b>*</b></span>
            <select name="timeframe" defaultValue="" required>
              <option value="" disabled>Select one</option>
              {TIMEFRAMES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="enquiry-full-width">
            <span>What are you trying to get done? <b>*</b></span>
            <textarea name="goal" rows={5} required maxLength={1000} onChange={(e) => setGoalLength(e.target.value.length)} />
            <small className="wfk-counter">{goalLength} / 1,000</small>
          </label>
          <label className="enquiry-full-width">
            <span>What’s in the way? <b>*</b></span>
            <textarea name="obstacle" rows={5} required maxLength={1000} onChange={(e) => setObstacleLength(e.target.value.length)} />
            <small className="wfk-counter">{obstacleLength} / 1,000</small>
          </label>
          <label className="enquiry-full-width">
            <span>How did you hear about The Africa Plug? <small>Optional</small></span>
            <select name="hearAbout" defaultValue="">
              <option value="">Select one</option>
              {HEAR_ABOUT.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <label className="wfk-consent">
          <input type="checkbox" name="consent" required />
          <span>I agree to the <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms</a>.</span>
        </label>

        {/* Hidden honeypot field: real people never see or fill this. */}
        <label className="enquiry-honeypot" aria-hidden="true">Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label>

        {siteKey ? <div className="enquiry-security"><div ref={widgetRef} /></div> : null}
        {error ? <p className="enquiry-status error" role="alert">{error}</p> : null}

        <div className="enquiry-submit-row">
          <button className="wfk-btn wfk-btn-primary" type="submit" disabled={busy || Boolean(siteKey && !token)}>
            {busy ? "SENDING…" : "START YOUR APPLICATION"}<span aria-hidden="true">→</span>
          </button>
        </div>
      </form>
    </section>
  );
}
