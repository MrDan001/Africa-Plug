"use client";

import { useEffect, useState, type FormEvent } from "react";

const SLOTS = [
  { slot: 1, title: "Hero 1 — Work With FK", note: "Wide image recommended: 2400 × 1200 px or larger." },
  { slot: 2, title: "Hero 2 — TAP IN", note: "Choose a clear image that still works behind large headline text." },
  { slot: 3, title: "Hero 3 — Ask The Africa Plug", note: "Use a landscape image; keep the main subject away from the left text area." },
];

type Notice = { tone: "success" | "error"; text: string };

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [images, setImages] = useState<(string | null)[]>([null, null, null]);
  const [files, setFiles] = useState<(File | null)[]>([null, null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null]);
  const [busySlot, setBusySlot] = useState<number | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  async function refreshImages() {
    try {
      const response = await fetch("/api/hero-images", { cache: "no-store" });
      const data = await response.json() as { images?: (string | null)[] };
      if (Array.isArray(data.images)) setImages([data.images[0] ?? null, data.images[1] ?? null, data.images[2] ?? null]);
    } catch {
      setNotice({ tone: "error", text: "Could not load the current hero images. Check your connection and refresh." });
    }
  }

  useEffect(() => {
    document.title = "Homepage Images | Africa Plug Admin";
    setAuthenticated(true);
    void refreshImages();
    setChecking(false);
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) {
        setNotice({ tone: "error", text: data.error || "Sign-in failed. Please try again." });
        return;
      }
      setPassword("");
      setAuthenticated(true);
      setNotice({ tone: "success", text: "You are signed in. Upload a new image to replace a hero slide." });
      await refreshImages();
    } catch {
      setNotice({ tone: "error", text: "Could not connect to the admin service. Please try again." });
    } finally {
      setLoginBusy(false);
    }
  }

  function chooseFile(slot: number, file: File | null) {
    setFiles((current) => current.map((existing, index) => index === slot - 1 ? file : existing));
    setPreviews((current) => current.map((existing, index) => {
      if (index !== slot - 1) return existing;
      return file ? URL.createObjectURL(file) : null;
    }));
    setNotice(null);
  }

  async function upload(slot: number) {
    const file = files[slot - 1];
    if (!file) {
      setNotice({ tone: "error", text: "Choose an image first." });
      return;
    }

    setBusySlot(slot);
    setNotice(null);
    try {
      const formData = new FormData();
      formData.set("slot", String(slot));
      formData.set("image", file);
      const response = await fetch("/api/admin/hero-images", { method: "POST", body: formData });
      const data = await response.json() as { ok?: boolean; error?: string; slot?: number; imageUrl?: string };
      if (!response.ok || !data.ok || !data.imageUrl) {
        setNotice({ tone: "error", text: data.error || "Upload failed. Please try again." });
        return;
      }
      setImages((current) => current.map((url, index) => index === slot - 1 ? data.imageUrl! : url));
      setFiles((current) => current.map((fileValue, index) => index === slot - 1 ? null : fileValue));
      setPreviews((current) => current.map((preview, index) => index === slot - 1 ? null : preview));
      const input = document.getElementById(`hero-image-${slot}`) as HTMLInputElement | null;
      if (input) input.value = "";
      setNotice({ tone: "success", text: `Hero ${slot} image uploaded. The homepage will use it automatically; refresh the homepage to verify the crop.` });
    } catch {
      setNotice({ tone: "error", text: "Could not connect to image storage. Please try again." });
    } finally {
      setBusySlot(null);
    }
  }

  if (checking) {
    return <main className="tap-admin-page"><div className="tap-admin-shell"><p className="tap-admin-muted">Checking secure admin session…</p></div></main>;
  }

  return (
    <main className="tap-admin-page">
      <div className="tap-admin-shell">
        <header className="tap-admin-header">
          <a className="tap-admin-brand" href="/" aria-label="Africa Plug homepage"><span className="tap-admin-brand-mark">AP</span><span><small>THE</small><b>AFRICA PLUG</b></span></a>
          <a className="tap-admin-back" href="/">Back to website ↗</a>
        </header>

        <section className="tap-admin-intro">
          <p className="tap-admin-eyebrow">HOMEPAGE CONTROL</p>
          <h1>Hero image manager.</h1>
          <p>Upload or replace the image for each carousel slide. You do not need to edit code. Images are saved to the media bucket and picked up by the homepage automatically.</p>
          <p><a className="tap-admin-primary" href="/admin/tap-in">Manage TAP IN opportunities →</a></p>
        </section>

        {notice ? <p className={`tap-admin-notice tap-admin-notice--${notice.tone}`} role="status">{notice.text}</p> : null}

        {!authenticated ? (
          <section className="tap-admin-login">
            <h2>Admin sign-in</h2>
            <p>Sign in with the admin password configured for this website.</p>
            <form onSubmit={login}>
              <label htmlFor="tap-admin-password">Admin password</label>
              <input id="tap-admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              <button className="tap-admin-primary" type="submit" disabled={loginBusy}>{loginBusy ? "Signing in…" : "Sign in"}</button>
            </form>
            <p className="tap-admin-small">First time setting this up? The website owner must configure the admin and image-storage environment variables.</p><a className="tap-admin-setup-link" href="https://github.com/MrDan001/Africa-Plug/blob/main/docs/HERO_IMAGE_ADMIN_SETUP.md" target="_blank" rel="noreferrer">Open the one-time setup guide ↗</a>
          </section>
        ) : (
          <>
            <div className="tap-admin-toolbar">
              <div><strong>Three carousel slides</strong><span>JPG, PNG, WebP or AVIF · Maximum 10 MB per image</span></div>
              <button className="tap-admin-secondary" type="button" onClick={() => void refreshImages()}>Refresh images</button>
            </div>
            <div className="tap-admin-grid">
              {SLOTS.map(({ slot, title, note }) => (
                <section className="tap-admin-card" key={slot}>
                  <div className="tap-admin-card-heading"><span>0{slot}</span><h2>{title}</h2></div>
                  <div className="tap-admin-preview">
                    {previews[slot - 1] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previews[slot - 1]!} alt={`Selected preview for hero slide ${slot}`} />
                    ) : images[slot - 1] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={images[slot - 1]!} alt={`Current homepage image for hero slide ${slot}`} />
                    ) : (
                      <div className="tap-admin-empty"><span>0{slot}</span><p>Built-in hero image is currently active.</p></div>
                    )}
                    <span className="tap-admin-preview-badge">{previews[slot - 1] ? "Selected preview" : images[slot - 1] ? "Custom image active" : "Default image"}</span>
                  </div>
                  <p className="tap-admin-card-note">{note}</p>
                  <label className="tap-admin-file-label" htmlFor={`hero-image-${slot}`}>Choose image</label>
                  <input className="tap-admin-file-input" id={`hero-image-${slot}`} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => chooseFile(slot, event.target.files?.[0] ?? null)} />
                  {files[slot - 1] ? <p className="tap-admin-filename">{files[slot - 1]!.name}</p> : <p className="tap-admin-filename">No new image selected</p>}
                  <button className="tap-admin-primary" type="button" disabled={!files[slot - 1] || busySlot !== null} onClick={() => void upload(slot)}>{busySlot === slot ? "Uploading…" : `Publish Hero ${slot} image`}</button>
                </section>
              ))}
            </div>
            <p className="tap-admin-footnote">Publishing replaces the custom image for that slide only. The headline, carousel order, and button destinations are unchanged.</p>
          </>
        )}

        <footer className="tap-admin-footer">Africa Plug Admin · Homepage images</footer>
      </div>
    </main>
  );
}
