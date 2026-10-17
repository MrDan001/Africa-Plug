// FILE PATH: src/components/work-with-fk/SchedulerClient.tsx
"use client";

import { useEffect, useState } from "react";

type Info = { name: string; bookingUrl: string; meetingMinutes: number | null; booked: boolean };

export default function SchedulerClient({ token }: { token: string }) {
  const [info, setInfo] = useState<Info | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/work-with-fk/schedule?token=${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json() as Partial<Info> & { error?: string };
        if (!active) return;
        if (!response.ok) { setError(data.error || "This scheduler link is not valid."); return; }
        setInfo(data as Info);
        setDone(Boolean(data.booked));
      })
      .catch(() => { if (active) setError("Could not load the scheduler. Please check your connection and refresh."); });
    return () => { active = false; };
  }, [token]);

  async function confirmBooked() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/work-with-fk/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action: "booked" }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) { setError(data.error || "We couldn't record that. Please try again."); return; }
      setDone(true);
    } catch {
      setError("We couldn't record that. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const card = { maxWidth: 720, margin: "0 auto", padding: "clamp(22px, 4vw, 40px)" } as const;

  if (error && !info) return <section className="standard-card" style={card}><p className="enquiry-status error" role="alert">{error}</p><p style={{ marginTop: 16 }}>Email <a href="mailto:fk@theafricaplug.com">fk@theafricaplug.com</a> if you need a new link.</p></section>;
  if (!info) return <section className="standard-card" style={card}><p>Checking your private link…</p></section>;

  return (
    <section className="standard-card" style={card}>
      <h2 style={{ margin: "0 0 10px", fontSize: 26, letterSpacing: "-.04em" }}>{info.name ? `Hello ${info.name}.` : "Hello."}</h2>
      {done ? (
        <p role="status" style={{ lineHeight: 1.7 }}>Thank you. We have recorded that your meeting is booked. Check your calendar invitation for the time, and reply to your scheduler email if you need to change it.</p>
      ) : (
        <>
          <p style={{ lineHeight: 1.7, color: "#626469" }}>Your payment is confirmed. Pick a time that suits you{info.meetingMinutes ? ` for your ${info.meetingMinutes}-minute meeting` : ""}. The scheduler opens in a new tab.</p>
          <p style={{ margin: "22px 0" }}><a className="standard-button" href={info.bookingUrl} target="_blank" rel="noopener noreferrer">OPEN THE SCHEDULER <span aria-hidden="true">↗</span></a></p>
          <p style={{ lineHeight: 1.7, color: "#626469" }}>Once you have chosen a time and received the booking confirmation, come back and tell us so the team can prepare.</p>
          <button type="button" className="standard-button" disabled={busy} onClick={() => void confirmBooked()} style={{ marginTop: 12, cursor: "pointer" }}>{busy ? "Saving…" : "I HAVE BOOKED MY MEETING"}</button>
          {error ? <p className="enquiry-status error" role="alert" style={{ marginTop: 14 }}>{error}</p> : null}
        </>
      )}
    </section>
  );
}
