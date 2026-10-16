"use client";

import { useState, type FormEvent } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/forms/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, website, source: "Homepage — Stay Plugged In" }),
      });
      const data = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || "We couldn't save your signup. Please try again.");
      setEmail("");
      setName("");
      setNotice({ ok: true, text: "You're on the list. Stay plugged in." });
    } catch (error) {
      setNotice({ ok: false, text: error instanceof Error ? error.message : "We couldn't save your signup. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="content-section" id="stay-plugged-in" style={{ padding: "clamp(46px,7vw,86px) clamp(20px,6vw,90px)", background: "#17181d", color: "#f7f5f1" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", alignItems: "center", gap: 30 }}>
        <div><p className="eyebrow">STAY PLUGGED IN</p><h2 style={{ fontSize: "clamp(30px,4.5vw,52px)", lineHeight: 1, letterSpacing: "-.05em", margin: "0 0 14px" }}>Keep your ear to the ground.</h2><p style={{ maxWidth: 520, lineHeight: 1.7, color: "#c6c6ca" }}>Occasional updates, practical perspectives and noteworthy opportunities from across Africa. No noise, just useful context.</p></div>
        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700 }}>Name (optional)<input value={name} onChange={(event) => setName(event.target.value)} maxLength={160} autoComplete="name" style={{ padding: "13px 14px", color: "#202126", background: "#fff", border: "1px solid #6a6b70", borderRadius: 3, font: "inherit" }} /></label>
          <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700 }}>Email address<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} autoComplete="email" style={{ padding: "13px 14px", color: "#202126", background: "#fff", border: "1px solid #6a6b70", borderRadius: 3, font: "inherit" }} /></label>
          <div aria-hidden="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}><label>Leave this blank<input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label></div>
          <button type="submit" disabled={busy} style={{ justifySelf: "start", padding: "13px 18px", cursor: busy ? "wait" : "pointer", border: 0, borderRadius: 3, background: "#d51f6d", color: "#fff", fontWeight: 800 }}>{busy ? "SAVING…" : "SIGN ME UP →"}</button>
          <p style={{ fontSize: 12, lineHeight: 1.5, color: "#c6c6ca", margin: 0 }}>By subscribing, you agree to receive email updates from The Africa Plug. You can request removal at any time.</p>
          {notice ? <p role="status" style={{ color: notice.ok ? "#a0e8c7" : "#ffd1d1", margin: 0 }}>{notice.text}</p> : null}
        </form>
      </div>
    </section>
  );
}
