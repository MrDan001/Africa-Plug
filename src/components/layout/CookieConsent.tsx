// FILE PATH: src/components/layout/CookieConsent.tsx
"use client";

import { useState, useSyncExternalStore } from "react";

type Consent = "analytics" | "necessary";

const CONSENT_KEY = "tap-consent-v1";

function subscribe(onChange: () => void) {
  window.addEventListener("tap:consent-changed", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("tap:consent-changed", onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): "needed" | "saved" | "hidden" {
  if (window.location.pathname.startsWith("/admin")) return "hidden";
  try {
    const saved = localStorage.getItem(CONSENT_KEY);
    return saved === "analytics" || saved === "necessary" ? "saved" : "needed";
  } catch {
    return "needed";
  }
}

export default function CookieConsent() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => "hidden" as const);
  const [dismissed, setDismissed] = useState(false);

  function save(value: Consent) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch { /* Continue with the current page if storage is unavailable. */ }
    setDismissed(true);
    window.dispatchEvent(new Event("tap:consent-changed"));
  }

  if (state !== "needed" || dismissed) return null;

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