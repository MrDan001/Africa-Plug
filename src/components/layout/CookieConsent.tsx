"use client";

import { useEffect, useState } from "react";

type Consent = "analytics" | "necessary";

const CONSENT_KEY = "tap-consent-v1";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) return;
    try {
      const saved = localStorage.getItem(CONSENT_KEY);
      if (saved !== "analytics" && saved !== "necessary") setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function save(value: Consent) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch { /* Continue with the current page if storage is unavailable. */ }
    setVisible(false);
    window.dispatchEvent(new Event("tap:consent-changed"));
  }

  if (!visible) return null;

  return (
    <aside className="tap-cookie-consent" role="dialog" aria-modal="false" aria-labelledby="tap-cookie-heading">
      <div className="tap-cookie-copy">
        <p className="tap-cookie-eyebrow">YOUR PRIVACY</p>
        <h2 id="tap-cookie-heading">Your choices matter.</h2>
        <p>We use essential storage for basic site functions. Optional analytics help us understand which pages and routes are useful. You can accept or reject analytics; essential storage stays on.</p>
        <a href="/cookies">Read the cookie policy</a>
      </div>
      <div className="tap-cookie-actions">
        <button type="button" className="tap-cookie-reject" onClick={() => save("necessary")}>Reject optional</button>
        <button type="button" className="tap-cookie-accept" onClick={() => save("analytics")}>Accept analytics</button>
      </div>
    </aside>
  );
}
