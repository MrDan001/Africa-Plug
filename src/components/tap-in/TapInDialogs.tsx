"use client";

import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import { INTEREST_TIMEFRAMES, IMAGE_MAX_BYTES } from "@/lib/tap-in/forms";
import { AFRICAN_COUNTRIES } from "@/lib/work-with-fk/application-schema";
import type { PublicListing } from "@/lib/tap-in/public";
import { useTurnstile } from "@/components/work-with-fk/useTurnstile";

const THANKS = "Thank you. We’ll be in touch if it’s a fit.";

function Modal({ title, onClose, children, success = false }: { title: string; onClose: () => void; children: ReactNode; success?: boolean }) {
  const titleId = useId();
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Capture phase, so Escape closes this dialog first and not the listing panel behind it.
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { event.stopPropagation(); onClose(); } };
    document.addEventListener("keydown", onKey, true);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", onKey, true); };
  }, [onClose]);
  return (
    <div className={`ti-modal-wrap${success ? " ti-modal-wrap-success" : ""}`}>
      <div className="ti-modal-overlay" onClick={onClose} aria-hidden="true" />
      <div className={`ti-modal${success ? " ti-modal-success" : ""}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button type="button" className="ti-panel-close" aria-label="Close" onClick={onClose}>×</button>
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

function Done({ onClose, text = THANKS }: { onClose: () => void; text?: string }) {
  return (
    <div className="ti-done" role="status" aria-live="polite">
      <div className="ti-done-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M5 12.5 9.2 16.5 19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="ti-done-kicker">SUBMISSION RECEIVED</span>
      <h3>Thank you!</h3>
      <p>{text}</p>
      <button type="button" className="ti-btn ti-btn-primary ti-done-close" onClick={onClose}>DONE<span aria-hidden="true">→</span></button>
    </div>
  );
}

function Consent({ children }: { children: ReactNode }) {
  return <label className="ti-consent"><input type="checkbox" name="consent" required /><span>{children}</span></label>;
}

function Honeypot() {
  // Hidden from people. Bots fill it, and the server then quietly ignores the submission.
  return <label className="ti-honeypot" aria-hidden="true">Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label>;
}

function useSubmit(send: (form: HTMLFormElement, token: string) => Promise<Response>, token: string) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await send(event.currentTarget, token);
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) { setError(result.error || "We couldn’t send that. Please try again."); return; }
      setDone(true);
    } catch {
      setError("We couldn’t connect to the form service. Please email connect@theafricaplug.com directly.");
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, done, onSubmit };
}

const policyLinks = <>the <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms</a></>;

/* Express Interest (opens from inside a listing) */
export function ExpressInterestDialog({ listing, onClose }: { listing: PublicListing; onClose: () => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const { widgetRef, token } = useTurnstile(siteKey);
  const [length, setLength] = useState(0);
  const { busy, error, done, onSubmit } = useSubmit((form, turnstileToken) => {
    const data = new FormData(form);
    const body = {
      name: data.get("name"), company: data.get("company"), email: data.get("email"), phone: data.get("phone"),
      country: data.get("country"), looking: data.get("looking"), timeframe: data.get("timeframe"),
      consent: data.get("consent") === "on", website: data.get("website"), turnstileToken,
    };
    return fetch(`/api/tap-in/${encodeURIComponent(listing.slug)}/interest`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  }, token);

  return (
    <Modal title="Express interest" onClose={onClose} success={done}>
      {done ? <Done onClose={onClose} text="We’ll review your interest and be in touch." /> : (
        <form className="ti-form" onSubmit={onSubmit}>
          <label className="ti-full"><span>Opportunity <b>*</b></span>
            <input value={listing.title} readOnly aria-readonly="true" className="ti-readonly" />
          </label>
          <label><span>Full name <b>*</b></span><input name="name" autoComplete="name" required maxLength={120} /></label>
          <label><span>Company or organisation <small>Optional</small></span><input name="company" autoComplete="organization" maxLength={160} /></label>
          <label><span>Email address <b>*</b></span><input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
          <label><span>Phone or WhatsApp <small>Optional</small></span><input name="phone" type="tel" autoComplete="tel" maxLength={30} pattern="\+[0-9][0-9 ()\-]{5,28}" placeholder="+234 (0) 913 - XXX - XXXX" title="Include your country code, for example +234" /></label>
          <label className="ti-full"><span>Country you’re based in <b>*</b></span>
            <select name="country" defaultValue="" required><option value="" disabled>Select a country</option>{AFRICAN_COUNTRIES.map((country) => <option key={country} value={country}>{country}</option>)}</select>
          </label>
          <label className="ti-full"><span>What are you looking for? <b>*</b></span>
            <textarea name="looking" rows={4} required maxLength={500} onChange={(e) => setLength(e.target.value.length)} />
            <small className="ti-count">{length} / 500</small>
          </label>
          <label className="ti-full"><span>Timeframe <small>Optional</small></span>
            <select name="timeframe" defaultValue=""><option value="">Select one</option>{INTEREST_TIMEFRAMES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
          </label>
          <Consent>I agree to {policyLinks}, and to The Africa Plug contacting me about this opportunity. I understand listings are shared for information only and I will carry out my own due diligence.</Consent>
          <Honeypot />
          {siteKey ? <div className="ti-full"><div ref={widgetRef} /></div> : null}
          {error ? <p className="ti-error" role="alert">{error}</p> : null}
          <button className="ti-btn ti-btn-primary ti-submit" type="submit" disabled={busy || Boolean(siteKey && !token)}>{busy ? "SENDING…" : "EXPRESS INTEREST"}<span aria-hidden="true">→</span></button>
        </form>
      )}
    </Modal>
  );
}

/* Register your interest (no live listing needed) */
export function RegisterInterestDialog({ onClose }: { onClose: () => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const { widgetRef, token } = useTurnstile(siteKey);
  const { busy, error, done, onSubmit } = useSubmit((form, turnstileToken) => {
    const data = new FormData(form);
    data.set("kind", "register");
    data.set("consent", data.get("consent") === "on" ? "true" : "false");
    data.set("turnstileToken", turnstileToken);
    return fetch("/api/tap-in/enquiry", { method: "POST", body: data });
  }, token);

  return (
    <Modal title="Register your interest" onClose={onClose} success={done}>
      {done ? <Done onClose={onClose} text="We’ll let you know when matching opportunities go live." /> : (
        <form className="ti-form" onSubmit={onSubmit}>
          <label><span>Name <b>*</b></span><input name="name" autoComplete="name" required maxLength={120} /></label>
          <label><span>Company or organisation <small>Optional</small></span><input name="company" autoComplete="organization" maxLength={160} /></label>
          <label className="ti-full"><span>Email address <b>*</b></span><input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
          <label className="ti-full"><span>What you’re looking for <b>*</b></span><textarea name="looking" rows={4} required maxLength={1000} /></label>
          <label className="ti-full"><span>Country of interest <b>*</b></span>
            <select name="country" defaultValue="" required><option value="" disabled>Select a country</option>{AFRICAN_COUNTRIES.map((country) => <option key={country} value={country}>{country}</option>)}</select>
          </label>
          <Consent>I agree to {policyLinks}.</Consent>
          <Honeypot />
          {siteKey ? <div className="ti-full"><div ref={widgetRef} /></div> : null}
          {error ? <p className="ti-error" role="alert">{error}</p> : null}
          <button className="ti-btn ti-btn-primary ti-submit" type="submit" disabled={busy || Boolean(siteKey && !token)}>{busy ? "SENDING…" : "REGISTER YOUR INTEREST"}<span aria-hidden="true">→</span></button>
        </form>
      )}
    </Modal>
  );
}

/* Submit an opportunity (with optional image) */
export function SubmitOpportunityDialog({ onClose }: { onClose: () => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const { widgetRef, token } = useTurnstile(siteKey);
  const [fileError, setFileError] = useState("");
  const { busy, error, done, onSubmit } = useSubmit((form, turnstileToken) => {
    const data = new FormData(form);
    data.set("kind", "opportunity");
    data.set("consent", data.get("consent") === "on" ? "true" : "false");
    data.set("turnstileToken", turnstileToken);
    return fetch("/api/tap-in/enquiry", { method: "POST", body: data });
  }, token);

  return (
    <Modal title="Submit an opportunity" onClose={onClose} success={done}>
      {done ? <Done onClose={onClose} text="We’ll review it and be in touch if it’s a fit." /> : (
        <form className="ti-form" onSubmit={(event) => { if (fileError) { event.preventDefault(); return; } void onSubmit(event); }}>
          <label><span>Name <b>*</b></span><input name="name" autoComplete="name" required maxLength={120} /></label>
          <label><span>Company or organisation <small>Optional</small></span><input name="company" autoComplete="organization" maxLength={160} /></label>
          <label className="ti-full"><span>Email address <b>*</b></span><input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
          <label className="ti-full"><span>What’s on offer <b>*</b></span><textarea name="offer" rows={4} required maxLength={2000} /></label>
          <label><span>Location <b>*</b></span><input name="location" required maxLength={200} /></label>
          <label><span>Type of commercial partner sought <b>*</b></span><input name="partner" required maxLength={300} /></label>
          <label className="ti-full"><span>Image <small>Optional · JPG, PNG or WebP, up to 5 MB</small></span>
            <input name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => {
              const file = e.target.files?.[0];
              setFileError(file && file.size > IMAGE_MAX_BYTES ? "That image is larger than 5 MB. Please choose a smaller one." : "");
            }} />
            {fileError ? <small className="ti-error">{fileError}</small> : null}
          </label>
          <Consent>I agree to {policyLinks}.</Consent>
          <Honeypot />
          {siteKey ? <div className="ti-full"><div ref={widgetRef} /></div> : null}
          {error ? <p className="ti-error" role="alert">{error}</p> : null}
          <button className="ti-btn ti-btn-primary ti-submit" type="submit" disabled={busy || Boolean(siteKey && !token)}>{busy ? "SENDING…" : "SUBMIT AN OPPORTUNITY"}<span aria-hidden="true">→</span></button>
        </form>
      )}
    </Modal>
  );
}

/* Opportunity alerts (inline band) */
export function AlertsSignup() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/tap-in/alerts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), website: data.get("website") }) });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) { setError(result.error || "We couldn’t sign you up. Please try again."); return; }
      setDone(true);
    } catch {
      setError("We couldn’t connect. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) return <p className="ti-alerts-done" role="status" aria-live="polite">You’re signed up. We’ll email you when a new opportunity is published.</p>;
  return (
    <form className="ti-alerts-form" onSubmit={onSubmit}>
      <div className="ti-alerts-row">
        <label className="ti-sr" htmlFor="ti-alerts-email">Email address</label>
        <input id="ti-alerts-email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="EMAIL ADDRESS" />
        <Honeypot />
        <button className="ti-btn ti-btn-primary" type="submit" disabled={busy}>{busy ? "SIGNING UP…" : "SIGN UP"}<span aria-hidden="true">→</span></button>
      </div>
      {error ? <p className="ti-error" role="alert">{error}</p> : null}
      <p className="ti-alerts-fine">Unsubscribe at any time. <a href="/privacy">Privacy Policy</a>.</p>
    </form>
  );
}