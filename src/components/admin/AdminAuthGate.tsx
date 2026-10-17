"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";

export default function AdminAuthGate({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/session", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json() as { authenticated?: boolean };
        if (active) setAuthenticated(response.ok && data.authenticated === true);
      })
      .catch(() => { if (active) setError("Could not check the admin session. Refresh and try again."); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json() as { error?: string; ok?: boolean };
      if (!response.ok || !data.ok) {
        setError(data.error || "Sign-in failed. Please try again.");
        return;
      }
      setPassword("");
      setAuthenticated(true);
    } catch {
      setError("Could not connect to the admin service. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    try { await fetch("/api/admin/session", { method: "DELETE" }); }
    finally {
      setAuthenticated(false);
      window.location.assign("/admin");
    }
  }

  if (checking) return <main className="ap-admin"><p>Checking secure admin session…</p></main>;

  if (!authenticated) {
    return (
      <main className="ap-admin ap-admin-login" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <section className="ap-admin-login-card" style={{ width: "min(100%, 480px)" }}>
          <a className="ap-admin-brand" href="/"><span>AP</span><b>THE AFRICA PLUG</b></a>
          <p className="ap-admin-eyebrow" style={{ marginTop: 32 }}>PRIVATE WORKSPACE</p>
          <h1>Welcome back.</h1>
          <p>Sign in to manage the website, content, media and business enquiries.</p>
          <form onSubmit={signIn}>
            <label htmlFor="admin-gate-password">Admin password</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input id="admin-gate-password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required style={{ width: "100%", paddingRight: 76 }} />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", border: "1px solid currentColor", borderRadius: 6, background: "transparent", padding: "5px 8px", fontSize: 12, lineHeight: 1.2, cursor: "pointer" }}>{showPassword ? "Hide" : "Show"}</button>
            </div>
            {error && <p className="ap-admin-error" role="alert">{error}</p>}
            <button type="submit" disabled={busy}>{busy ? "Signing in…" : "SIGN IN →"}</button>
          </form>
          <p style={{ marginTop: 18, fontSize: 12, opacity: .7 }}>The admin workspace is private. Sign out when you finish managing the site.</p>
        </section>
      </main>
    );
  }

  return (
    <>
      <div style={{ position: "sticky", top: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "9px clamp(16px, 4vw, 48px)", background: "#17181d", color: "#f7f7f7", fontSize: 12 }}>
        <a href="/admin" style={{ color: "inherit", textDecoration: "none", fontWeight: 800, letterSpacing: ".08em" }}>AFRICA PLUG · ADMIN</a>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}><span>Secure session</span><button type="button" onClick={signOut} style={{ background: "transparent", color: "inherit", border: "1px solid #60616a", padding: "7px 12px", cursor: "pointer" }}>Sign out</button></div>
      </div>
      {children}
    </>
  );
}
