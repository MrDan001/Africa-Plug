"use client";

import { useState, type FormEvent } from "react";
import BrandLogo from "@/components/layout/BrandLogo";

export default function SiteGate() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/site-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        cache: "no-store",
      });
      const data = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error || "Access could not be verified. Please try again.");
        return;
      }
      const next = new URLSearchParams(window.location.search).get("next");
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/site-access") ? next : "/";
      window.location.replace(safeNext);
    } catch {
      setError("Could not connect securely. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="tap-site-gate">
      <section className="tap-site-gate-card" aria-labelledby="tap-site-gate-title">
        <div className="tap-site-gate-logo"><BrandLogo height={76} /></div>
        <p className="tap-site-gate-eyebrow">PRIVATE WEBSITE ACCESS</p>
        <h1 id="tap-site-gate-title">A little patience.<br /><span>A password first.</span></h1>
        <p className="tap-site-gate-copy">The Africa Plug is currently private. Enter the access password to continue to the website.</p>
        <form onSubmit={unlock}>
          <label htmlFor="site-gate-password">Access password</label>
          <div className="tap-site-gate-input-wrap">
            <input id="site-gate-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required autoFocus />
            <button className="tap-site-gate-toggle" type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "HIDE" : "SHOW"}</button>
          </div>
          {error && <p className="tap-site-gate-error" role="alert">{error}</p>}
          <button className="tap-site-gate-submit" type="submit" disabled={busy}>{busy ? "VERIFYING…" : "UNLOCK WEBSITE →"}</button>
        </form>
        <p className="tap-site-gate-foot">Access is protected. Your password is verified securely by the server.</p>
      </section>
    </main>
  );
}
