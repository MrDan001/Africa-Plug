"use client";

export default function CookieSettingsLink() {
  return (
    <button
      type="button"
      className="tap-cookie-settings-link"
      onClick={() => window.dispatchEvent(new Event("tap:open-cookie-settings"))}
    >
      Cookie settings
    </button>
  );
}
