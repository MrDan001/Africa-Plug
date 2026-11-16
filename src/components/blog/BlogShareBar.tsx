"use client";

import { useState } from "react";

export default function BlogShareBar({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }
  return <nav className="blog-share-bar" aria-label="Share this article">
    <span>SHARE THIS STORY</span>
    <a href={"https://wa.me/?text=" + encodedTitle + "%20" + encodedUrl} target="_blank" rel="noreferrer">WhatsApp ↗</a>
    <a href={"https://www.linkedin.com/sharing/share-offsite/?url=" + encodedUrl} target="_blank" rel="noreferrer">LinkedIn ↗</a>
    <button type="button" onClick={copyLink}>{copied ? "Copied" : "Copy link"}</button>
  </nav>;
}
