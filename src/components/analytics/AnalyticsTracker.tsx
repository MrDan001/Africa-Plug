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

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const body = JSON.stringify({
      eventName: "page_view",
      path: pathname || "/",
      query: window.location.search,
      referrer: document.referrer,
      source: params.get("utm_source") || document.referrer || "direct",
      utm: getUtm(),
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/event", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/analytics/event", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
    }
  }, [pathname]);

  return null;
}
