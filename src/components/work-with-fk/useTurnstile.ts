"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        "expired-callback"?: () => void;
        "error-callback"?: () => void;
        theme?: "dark" | "light" | "auto";
      }) => string;
      remove: (id: string) => void;
    };
  }
}

/** Renders Cloudflare Turnstile into widgetRef when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set. */
export function useTurnstile(siteKey: string | undefined) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!siteKey || !widgetRef.current) return;
    let cancelled = false;
    let script = document.getElementById("cloudflare-turnstile-script") as HTMLScriptElement | null;
    const render = () => {
      if (cancelled || !window.turnstile || !widgetRef.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(widgetRef.current, {
        sitekey: siteKey,
        theme: "light",
        callback: setToken,
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
      });
    };
    if (window.turnstile) render();
    else {
      if (!script) {
        script = document.createElement("script");
        script.id = "cloudflare-turnstile-script";
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
      }
      script.addEventListener("load", render);
      if (!script.isConnected) document.head.appendChild(script);
    }
    return () => {
      cancelled = true;
      script?.removeEventListener("load", render);
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey]);

  return { widgetRef, token };
}