// FILE PATH: src/components/layout/CookieConsent.tsx
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type Consent = "embedded" | "necessary";

const CONSENT_KEY = "tap-consent-v1";

function subscribe(onChange: () => void) {
  window.addEventListener("tap:consent-changed", onChange);
  window.addEventListener("tap:open-cookie-settings", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("tap:consent-changed", onChange);
    window.removeEventListener("tap:open-cookie-settings", onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): "needed" | "saved" | "hidden" {
  if (window.location.pathname.startsWith("/admin")) return "hidden";
  try {
    const saved = localStorage.getItem(CONSENT_KEY);
    return saved === "embedded" || saved === "necessary" ? "saved" : "needed";
  } catch {
    return "needed";
  }
}

export default function CookieConsent() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => "hidden" as const);
  const [dismissed, setDismissed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const openSettings = () => {
      setDismissed(false);
      setSettingsOpen(true);
    };
    window.addEventListener("tap:open-cookie-settings", openSettings);
    return () => window.removeEventListener("tap:open-cookie-settings", openSettings);
  }, []);

  function save(value: Consent) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch { /* Keep the current page usable if storage is unavailable. */ }
    setDismissed(true);
    setSettingsOpen(false);
    window.dispatchEvent(new Event("tap:consent-changed"));
  }

  if (state === "hidden" || (state !== "needed" && !settingsOpen) || dismissed) return null;

  return (
    <aside className="tap-cookie-consent" role="dialog" aria-modal="false" aria-labelledby="tap-cookie-heading">
      <div className="tap-cookie-copy">
        <p className="tap-cookie-eyebrow">YOUR PRIVACY</p>
        <h2 id="tap-cookie-heading">Your choices matter.</h2>
        <p>Essential technologies keep the site secure and working. We do not use analytics or advertising cookies. YouTube videos are optional embedded content and are loaded only when you allow them or choose to play them.</p>
        <a href="/cookies">Read the cookie policy</a>
      </div>
      <div className="tap-cookie-actions">
        <button type="button" className="tap-cookie-reject" onClick={() => save("necessary")}>Reject optional</button>
        <button type="button" className="tap-cookie-accept" onClick={() => save("embedded")}>Allow embedded content</button>
      </div>
    </aside>
  );
}
