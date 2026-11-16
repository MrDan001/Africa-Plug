"use client";

import { useState, type FormEvent } from "react";

export default function BlogNewsletterSignup() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch("/api/blog/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website: data.get("website") || "" }),
      });
      const result = await response.json() as { ok?: boolean; error?: string; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "We couldn't save your subscription. Please try again.");
      setEmail("");
      setNotice({ tone: "success", text: result.message || "Check your inbox for a confirmation email." });
      form.reset();
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "We couldn't save your subscription. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="blog-newsletter" aria-labelledby="blog-newsletter-title">
      <div className="blog-newsletter-mark" aria-hidden="true"><span className="blog-newsletter-wave">〰〰〰</span><span className="blog-newsletter-circle">TAP</span></div>
      <div className="blog-newsletter-copy">
        <h2 id="blog-newsletter-title">Get new articles by email.</h2>
        <p>Insights, stories and opportunities from across Africa, straight to your inbox.</p>
      </div>
      <form className="blog-newsletter-form" onSubmit={submit}>
        <label className="blog-newsletter-visually-hidden" htmlFor="blog-newsletter-email">Email address</label>
        <input id="blog-newsletter-email" type="email" name="email" required maxLength={254} autoComplete="email" placeholder="Enter your email address" value={email} onChange={(event) => setEmail(event.target.value)} />
        <div className="blog-newsletter-honeypot" aria-hidden="true"><label>Leave this blank<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
        <button type="submit" disabled={busy}>{busy ? "SUBSCRIBING…" : "SUBSCRIBE"} <span aria-hidden="true">→</span></button>
        <p className="blog-newsletter-note">Unsubscribe at any time. <a href="/privacy">Privacy Policy.</a></p>
        {notice ? <p className={"blog-newsletter-status is-" + notice.tone} role="status" aria-live="polite">{notice.text}</p> : null}
      </form>
    </section>
  );
}
