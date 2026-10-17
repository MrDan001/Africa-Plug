// FILE PATH: src/components/analytics/AnalyticsTracker.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getUtm() {
  const search = new URLSearchParams(window.location.search);
  return {
    utm_source: search.get("utm_source") || "",
    utm_medium: search.get("utm_medium") || "",
    utm_campaign: search.get("utm_campaign") || "",
    utm_content: search.get("utm_content") || "",
    utm_term: search.get("utm_term") || "",
  };
}

function hasAnalyticsConsent() {
  try { return localStorage.getItem("tap-consent-v1") === "analytics"; } catch { return false; }
}

function record(eventName: string, extras: Record<string, unknown> = {}) {
  if (!hasAnalyticsConsent()) return;
  const params = new URLSearchParams(window.location.search);
  const body = JSON.stringify({
    eventName,
    path: window.location.pathname || "/",
    query: window.location.search,
    referrer: document.referrer,
    source: params.get("utm_source") || document.referrer || "direct",
    utm: getUtm(),
    ...extras,
  });
  if (navigator.sendBeacon) {
    const queued = navigator.sendBeacon("/api/analytics/event", new Blob([body], { type: "application/json" }));
    if (queued) return;
  }
  void fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Private scheduler links carry a secret token in the URL, so they are never recorded.
    if ((pathname || "").startsWith("/admin") || (pathname || "").startsWith("/work-with-fk/schedule/")) return;
    record("page_view");
    const path = pathname || "/";
    if (path.startsWith("/blog/")) record("article_view", { label: path.split("/").filter(Boolean).at(-1) || "" });
    if (path.startsWith("/store/")) record("product_view", { label: path.split("/").filter(Boolean).at(-1) || "" });
    if (path.startsWith("/tap-in/")) record("listing_viewed", { label: path.split("/").filter(Boolean).at(-1) || "" });

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const cta = target.closest("a.button, a.text-link, a.header-cta, a.tap-footer-primary-link, a.blog-page-contact-link, a.featured-blog-view-all, button[type='submit']");
      if (!cta) return;
      const label = (cta.textContent || cta.getAttribute("aria-label") || "CTA").replace(/\s+/g, " ").trim().slice(0, 160);
      const href = cta instanceof HTMLAnchorElement ? cta.getAttribute("href") || "" : "";
      if (href.startsWith("/work-with-fk")) record("work_with_fk_click", { label, href });
      else record("cta_click", { label, href });
    };
    document.addEventListener("click", onClick);
    const consentChanged = () => { if (hasAnalyticsConsent()) record("page_view"); };
    window.addEventListener("tap:consent-changed", consentChanged);
    return () => { document.removeEventListener("click", onClick); window.removeEventListener("tap:consent-changed", consentChanged); };
  }, [pathname]);

  return null;
}
