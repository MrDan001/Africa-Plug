// FILE PATH: src/lib/youtube.ts
const ID = /^[A-Za-z0-9_-]{11}$/;

/** Returns the 11-character YouTube video ID from a pasted link (or a bare ID), or null. */
export function parseYouTubeId(input: string | undefined | null): string | null {
  const value = (input ?? "").trim();
  if (!value) return null;
  if (ID.test(value)) return value;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m|music)\./, "").toLowerCase();
  let candidate: string | null = null;
  if (host === "youtu.be") {
    candidate = url.pathname.split("/")[1] ?? null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") candidate = url.searchParams.get("v");
    else {
      const [, kind, id] = url.pathname.split("/");
      if (["embed", "shorts", "live", "v"].includes(kind)) candidate = id ?? null;
    }
  }
  return candidate && ID.test(candidate) ? candidate : null;
}