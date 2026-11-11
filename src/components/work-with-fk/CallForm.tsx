// FILE PATH: src/components/work-with-fk/CallForm.tsx
"use client";

import { useState, type FormEvent } from "react";
import { AFRICAN_COUNTRIES } from "@/lib/work-with-fk/application-schema";
import { useTurnstile } from "./useTurnstile";
import "./work-with-fk.css";

export default function CallForm() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const { widgetRef, token } = useTurnstile(siteKey);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [length, setLength] = useState(0);

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
      const response = await fetch("/api/work-with-fk/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string; paymentUrl?: string | null };
      if (!response.ok || !result.ok) {
        setError(result.error || "We couldn’t send your request. Please try again.");
        return;
      }
      if (result.paymentUrl) {
        // Straight to the £350 Stripe Payment Link. Stripe then sends them to FK’s booking page.
        window.location.assign(result.paymentUrl);
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
      <section className="enquiry-panel wfk-thanks" role="status" aria-live="polite">
        <h2>Thank you.</h2>
        <p>We have your question. We’ll email you the link to pay for your call shortly.</p>
      </section>
    );
  }

  return (
    <section className="enquiry-panel wfk-form-panel">
      <form className="enquiry-form" onSubmit={submit}>
        <div className="enquiry-form-grid">
          <label><span>Full name <b>*</b></span><input name="fullName" autoComplete="name" required maxLength={120} /></label>
          <label><span>Email <b>*</b></span><input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
          <label className="enquiry-full-width">
            <span>Country you’re based in <b>*</b></span>
            <select name="country" defaultValue="" required>
              <option value="" disabled>Select a country</option>
              {AFRICAN_COUNTRIES.map((country) => <option key={country} value={country}>{country}</option>)}
            </select>
          </label>
          <label className="enquiry-full-width">
            <span>Your question <b>*</b></span>
            <textarea name="question" rows={5} required maxLength={500} onChange={(e) => setLength(e.target.value.length)} />
            <small className="wfk-counter">{length} / 500</small>
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
            {busy ? "SENDING…" : "CONTINUE TO PAYMENT"}<span aria-hidden="true">→</span>
          </button>
        </div>
      </form>
    </section>
  );
}