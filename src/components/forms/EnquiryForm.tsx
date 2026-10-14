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

export default function EnquiryForm({ kind = "contact", opportunityName }: { kind?: Kind; opportunityName?: string }) {
  const form = config[kind];
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

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
      setNotice({ ok: true, text: "Thank you. Your enquiry has been sent to The Africa Plug." });
    } catch {
      setNotice({ ok: false, text: "We couldn't connect to the form service. Please email connect@theafricaplug.com directly." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="enquiry-panel">
      <header className="enquiry-panel-heading">
        <p className="standard-eyebrow">THE AFRICA PLUG</p>
        <h2>{form.title}</h2>
        <p>{form.description}</p>
      </header>
      <form className="enquiry-form" onSubmit={submit}>
        <div className="enquiry-form-grid">
          <label><span>Your name <b>*</b></span><input name="name" autoComplete="name" required minLength={2} maxLength={120} /></label>
          <label><span>Email address <b>*</b></span><input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
          <label><span>Organisation <small>Optional</small></span><input name="organisation" autoComplete="organization" maxLength={160} /></label>
          <label><span>Phone <small>Optional</small></span><input name="phone" type="tel" autoComplete="tel" maxLength={50} /></label>
          <label className="enquiry-full-width">
            <span>What is this about? <b>*</b></span>
            <select name="enquiryType" defaultValue={kind === "work" ? "Commercial consultancy — Work With FK" : kind === "partner" ? "Partnership" : kind === "ask" ? "Question for The Africa Plug" : kind === "interest" ? "TAP IN opportunity" : "General enquiry"} required>
              <option>General enquiry</option>
              <option>Commercial consultancy — Work With FK</option>
              <option>Business or investment opportunity</option>
              <option>Partnership</option>
              <option>Question for The Africa Plug</option>
              <option>Store or Africa Starter Guide</option>
              <option>TAP IN opportunity</option>
            </select>
          </label>
          {opportunityName ? <input type="hidden" name="opportunityName" value={opportunityName} /> : null}
          <label className="enquiry-full-width"><span>Your message <b>*</b></span><textarea name="message" rows={5} required minLength={10} maxLength={5000} placeholder="Tell us a little about your enquiry…" /></label>
        </div>
        <label className="enquiry-honeypot" aria-hidden="true">Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
        {siteKey ? <div className="enquiry-security"><div ref={widgetRef} /><small>Complete the security check before submitting.</small></div> : null}
        {notice ? <p className={`enquiry-status ${notice.ok ? "success" : "error"}`} role="status" aria-live="polite">{notice.text}{!notice.ok ? <>{" "}Email <a href="mailto:connect@theafricaplug.com">connect@theafricaplug.com</a> if you need another route.</> : null}</p> : null}
        <div className="enquiry-submit-row">
          <button className="standard-button" type="submit" disabled={busy || Boolean(siteKey && !token)}>{busy ? "SENDING…" : form.button}<span aria-hidden="true">→</span></button>
          <p>Or email <a href="mailto:connect@theafricaplug.com">connect@theafricaplug.com</a> directly.</p>
        </div>
        <p className="enquiry-privacy-note">Please do not include passwords, payment card details or other sensitive information.</p>
      </form>
    </section>
  );
}
