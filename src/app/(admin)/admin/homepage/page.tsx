"use client";

import { useEffect, useState, type FormEvent } from "react";

const SLOTS = [
  { slot: 1, variant: "desktop", index: 0, title: "Slide 1 — Desktop / Work With FK", note: "Landscape crop recommended: 2400 × 1200 px or larger." },
  { slot: 1, variant: "mobile", index: 1, title: "Slide 1 — Mobile / Work With FK", note: "Portrait/tall mobile crop. Keep FK or the main commercial subject visible behind the copy." },
  { slot: 2, variant: "desktop", index: 2, title: "Slide 2 — Desktop / TAP IN", note: "Show a real commercial asset, industry or opportunity at scale." },
  { slot: 2, variant: "mobile", index: 3, title: "Slide 2 — Mobile / TAP IN", note: "Use a dedicated portrait crop; do not rely on a resized desktop image." },
  { slot: 3, variant: "desktop", index: 4, title: "Slide 3 — Desktop / Ask The Africa Plug", note: "People, place and on-the-ground context from Africa." },
  { slot: 3, variant: "mobile", index: 5, title: "Slide 3 — Mobile / Ask The Africa Plug", note: "Use a separate mobile crop with the key subject clear of the text." },
] as const;

type Variant = "desktop" | "mobile";
type Notice = { tone: "success" | "error"; text: string };

function blankImages() { return Array.from({ length: 6 }, () => null as string | null); }

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [images, setImages] = useState<(string | null)[]>(blankImages());
  const [files, setFiles] = useState<(File | null)[]>(blankImages());
  const [previews, setPreviews] = useState<(string | null)[]>(blankImages());
  const [busySlot, setBusySlot] = useState<number | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  async function refreshImages() {
    try {
      const response = await fetch("/api/hero-images", { cache: "no-store" });
      const data = await response.json() as { images?: (string | null)[]; mobileImages?: (string | null)[] };
      const desktop = Array.isArray(data.images) ? data.images : [null, null, null];
      const mobile = Array.isArray(data.mobileImages) ? data.mobileImages : [null, null, null];
      setImages(SLOTS.map(({ slot, variant }) => variant === "desktop" ? desktop[slot - 1] ?? null : mobile[slot - 1] ?? null));
    } catch {
      setNotice({ tone: "error", text: "Could not load the current hero images. Check your connection and refresh." });
    }
  }

  useEffect(() => {
    document.title = "Homepage Manager | Africa Plug";
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
      const data = await response.json() as { error?: string; ok?: boolean };
      if (!response.ok || !data.ok) {
        setNotice({ tone: "error", text: data.error || "Sign-in failed. Please try again." });
        return;
      }
      setPassword("");
      setAuthenticated(true);
      setNotice({ tone: "success", text: "You are signed in. Upload a desktop and a mobile crop for each slide." });
      await refreshImages();
    } catch {
      setNotice({ tone: "error", text: "Could not connect to the admin service. Please try again." });
    } finally {
      setLoginBusy(false);
    }
  }

  function chooseFile(index: number, file: File | null) {
    setFiles((current) => current.map((existing, currentIndex) => currentIndex === index ? file : existing));
    setPreviews((current) => current.map((existing, currentIndex) => currentIndex === index ? (file ? URL.createObjectURL(file) : null) : existing));
    setNotice(null);
  }

  async function upload(index: number) {
    const slot = SLOTS[index];
    const file = files[index];
    if (!file) {
      setNotice({ tone: "error", text: "Choose an image first." });
      return;
    }

    setBusySlot(index);
    setNotice(null);
    try {
      const formData = new FormData();
      formData.set("slot", String(slot.slot));
      formData.set("variant", slot.variant);
      formData.set("image", file);
      const response = await fetch("/api/admin/hero-images", { method: "POST", body: formData });
      const data = await response.json() as { ok?: boolean; error?: string; slot?: number; variant?: Variant; imageUrl?: string };
      if (!response.ok || !data.ok || !data.imageUrl) {
        setNotice({ tone: "error", text: data.error || "Upload failed. Please try again." });
        return;
      }
      setImages((current) => current.map((url, currentIndex) => currentIndex === index ? data.imageUrl! : url));
      setFiles((current) => current.map((fileValue, currentIndex) => currentIndex === index ? null : fileValue));
      setPreviews((current) => current.map((preview, currentIndex) => currentIndex === index ? null : preview));
      const input = document.getElementById(`hero-image-${slot.slot}-${slot.variant}`) as HTMLInputElement | null;
      if (input) input.value = "";
      setNotice({ tone: "success", text: `Hero ${slot.slot} ${slot.variant} crop uploaded. The homepage will use it automatically.` });
    } catch {
      setNotice({ tone: "error", text: "Could not connect to image storage. Please try again." });
    } finally {
      setBusySlot(null);
    }
  }

  if (checking) return <main className="tap-admin-page"><div className="tap-admin-shell"><p className="tap-admin-muted">Checking secure admin session…</p></div></main>;

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
          <p>Replace the desktop and mobile photo for each slide without editing code. Hero copy remains live website text; no words are baked into these images.</p>
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
            <p className="tap-admin-small">The website owner must configure the admin and media-storage environment variables.</p><a className="tap-admin-setup-link" href="https://github.com/MrDan001/Africa-Plug/blob/main/docs/HERO_IMAGE_ADMIN_SETUP.md" target="_blank" rel="noreferrer">Open the one-time setup guide ↗</a>
          </section>
        ) : (
          <>
            <div className="tap-admin-toolbar">
              <div><strong>Three slides · six image crops</strong><span>JPG, PNG, WebP or AVIF · Maximum 10 MB per image</span></div>
              <button className="tap-admin-secondary" type="button" onClick={() => void refreshImages()}>Refresh images</button>
            </div>
            <div className="tap-admin-grid">
              {SLOTS.map(({ slot, variant, index, title, note }) => (
                <section className="tap-admin-card" key={`${slot}-${variant}`}>
                  <div className="tap-admin-card-heading"><span>0{slot}</span><h2>{title}</h2></div>
                  <div className="tap-admin-preview">
                    {previews[index] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previews[index]!} alt={`Selected preview for hero slide ${slot} ${variant} crop`} />
                    ) : images[index] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={images[index]!} alt={`Current homepage image for hero slide ${slot} ${variant} crop`} />
                    ) : (
                      <div className="tap-admin-empty"><span>0{slot}</span><p>{variant === "desktop" ? "Built-in desktop image is currently active." : "Mobile uses the desktop image until a mobile crop is uploaded."}</p></div>
                    )}
                    <span className="tap-admin-preview-badge">{previews[index] ? "Selected preview" : images[index] ? "Custom image active" : "Default image"}</span>
                  </div>
                  <p className="tap-admin-card-note">{note}</p>
                  <label className="tap-admin-file-label" htmlFor={`hero-image-${slot}-${variant}`}>Choose {variant} image</label>
                  <input className="tap-admin-file-input" id={`hero-image-${slot}-${variant}`} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => chooseFile(index, event.target.files?.[0] ?? null)} />
                  {files[index] ? <p className="tap-admin-filename">{files[index]!.name}</p> : <p className="tap-admin-filename">No new image selected</p>}
                  <button className="tap-admin-primary" type="button" disabled={!files[index] || busySlot !== null} onClick={() => void upload(index)}>{busySlot === index ? "Uploading…" : `Publish slide ${slot} ${variant} crop`}</button>
                </section>
              ))}
            </div>
            <p className="tap-admin-footnote">Replace one crop at a time. Headline, supporting line, caption and route buttons remain live and are not baked into the photos.</p>
          </>
        )}

        <footer className="tap-admin-footer">Africa Plug Admin · Homepage images</footer>
      </div>
    </main>
  );
}
