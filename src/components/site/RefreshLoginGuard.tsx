"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RefreshLoginGuard() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/site-access" || pathname.startsWith("/api/")) return;

    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (navigation?.type !== "reload") return;

    let cancelled = false;
    (async () => {
      try {
        await fetch("/api/site-gate/logout", {
          method: "POST",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
        });
      } finally {
        if (!cancelled) {
          const next = window.location.pathname + window.location.search;
          window.location.replace("/site-access?next=" + encodeURIComponent(next));
        }
      }
    })();

    return () => { cancelled = true; };
  }, [pathname]);

  return null;
}
