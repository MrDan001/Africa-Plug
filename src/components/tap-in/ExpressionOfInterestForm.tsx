"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Props = { slug: string; listingTitle: string; questions: string[] };
declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "expired-callback"?: () => void; "error-callback"?: () => void; theme?: "light" | "dark" | "auto" }) => string;
      remove: (id: string) => void;
    };
  }
}

export default function ExpressionOfInterestForm({ slug, listingTitle, questions }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [role, setRole] = useState("");
  const [whatYouCanOffer, setWhatYouCanOffer] = useState("");
  const [website, setWebsite] = useState("");
  const [answers, setAnswers] = useState<string[]>(questions.map(() => ""));
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
        theme: "light",
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

  function updateAnswer(index: number, value: string) {
    setAnswers((current) => current.map((answer, i) => i === index ? value : answer));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice(null);
    const query = new URLSearchParams(window.location.search);
    const utm = Object.fromEntries(["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].map((key) => [key, query.get(key) || ""]));
    try {
      const response = await fetch(`/api/tap-in/${encodeURIComponent(slug)}/interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, organisation, phone, country, role, whatYouCanOffer, website, turnstileToken: token,
          answers: questions.map((question, index) => ({ question, answer: answers[index] || "" })),
          sourcePath: window.location.pathname,
          referrer: document.referrer,
          utm,
        }),
      });
      const data = await response.json() as { ok?: boolean; message?: string; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || "We couldn't submit your expression of interest. Please try again.");
      setNotice({ ok: true, text: data.message || `Thanks, The Africa Plug has received your expression of interest in ${listingTitle}.` });
      setName(""); setEmail(""); setOrganisation(""); setPhone(""); setCountry(""); setRole(""); setWhatYouCanOffer(""); setAnswers(questions.map(() => "")); setToken("");
    } catch (error) {
      setNotice({ ok: false, text: error instanceof Error ? error.message : "We couldn't submit your expression of interest. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return <section className="enquiry-panel tap-in-eoi-panel" aria-labelledby="tap-in-eoi-title">
    <header className="enquiry-panel-heading">
      <p className="standard-eyebrow">TAP IN · EXPRESSION OF INTEREST</p>
      <h2 id="tap-in-eoi-title">Interested in this opportunity?</h2>
      <p>Your response will be linked to <strong>{listingTitle}</strong>. Please only share information relevant to the opportunity.</p>
    </header>
    <form className="enquiry-form" onSubmit={submit}>
      <div className="enquiry-form-grid">
        <label><span>Your name <b>*</b></span><input name="name" autoComplete="name" required minLength={2} maxLength={120} value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label><span>Email address <b>*</b></span><input name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label><span>Organisation <small>Optional</small></span><input name="organisation" autoComplete="organization" maxLength={160} value={organisation} onChange={(event) => setOrganisation(event.target.value)} /></label>
        <label><span>Phone / WhatsApp <small>Optional</small></span><input name="phone" type="tel" autoComplete="tel" maxLength={50} value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
        <label><span>Country / project location <small>Optional</small></span><input name="country" maxLength={200} value={country} onChange={(event) => setCountry(event.target.value)} /></label>
        <label><span>Your role <small>Optional</small></span><input name="role" maxLength={120} value={role} onChange={(event) => setRole(event.target.value)} /></label>
        <label className="enquiry-full-width"><span>What can you contribute or what do you need? <b>*</b></span><textarea name="whatYouCanOffer" rows={4} required minLength={10} maxLength={3000} value={whatYouCanOffer} onChange={(event) => setWhatYouCanOffer(event.target.value)} placeholder="Explain how you may be relevant to this opportunity." /></label>
        {questions.map((question, index) => <label className="enquiry-full-width" key={`${index}-${question}`}><span>{question} <b>*</b></span><textarea required rows={3} minLength={2} maxLength={2000} value={answers[index] || ""} onChange={(event) => updateAnswer(index, event.target.value)} /></label>)}
      </div>
      <div aria-hidden="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}><label>Leave this blank<input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label></div>
      {siteKey ? <div className="enquiry-security"><div ref={widgetRef} /><small>Complete the security check before submitting.</small></div> : null}
      {notice ? <p className={`enquiry-status ${notice.ok ? "success" : "error"}`} role="status" aria-live="polite">{notice.text}</p> : null}
      <div className="enquiry-submit-row"><button className="standard-button" type="submit" disabled={busy || Boolean(siteKey && !token)}>{busy ? "SUBMITTING…" : "SEND EXPRESSION OF INTEREST"}<span aria-hidden="true">→</span></button></div>
      <p className="enquiry-privacy-note">Your submission is saved for review. Do not include passwords, payment card details or other sensitive information.</p>
    </form>
  </section>;
}
