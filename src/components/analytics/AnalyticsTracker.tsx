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

function record(eventName: string, extras: Record<string, unknown> = {}) {
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
    if ((pathname || "").startsWith("/admin")) return;
    record("page_view");

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const cta = target.closest("a.button, a.text-link, a.header-cta, a.tap-footer-primary-link, a.blog-page-contact-link, a.featured-blog-view-all, button[type='submit']");
      if (!cta) return;
      const label = (cta.textContent || cta.getAttribute("aria-label") || "CTA").replace(/\s+/g, " ").trim().slice(0, 160);
      record("cta_click", { label });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  return null;
}
