"use client";

import { useEffect, useState } from "react";
import EnquiryForm from "@/components/forms/EnquiryForm";

type OpenDetail = { defaultArea?: string };

export function PartnershipTrigger({ className, children }: { className: string; children: React.ReactNode }) {
  return <button type="button" className={className} onClick={() => window.dispatchEvent(new CustomEvent<OpenDetail>("tap:open-partnership", { detail: { defaultArea: location.pathname.startsWith("/blog") ? "Article pitch" : "" } }))}>{children}</button>;
}

export default function PartnershipDialog() {
  const [open, setOpen] = useState(false);
  const [defaultArea, setDefaultArea] = useState("");
  useEffect(() => {
    const show = (event: Event) => {
      setDefaultArea((event as CustomEvent<OpenDetail>).detail?.defaultArea || "");
      setOpen(true);
    };
    window.addEventListener("tap:open-partnership", show);
    return () => window.removeEventListener("tap:open-partnership", show);
  }, []);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", closeOnEscape); document.body.style.overflow = ""; };
  }, [open]);
  if (!open) return null;
  return <div className="partnership-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
    <section className="partnership-dialog" role="dialog" aria-modal="true" aria-labelledby="partnership-dialog-title">
      <button type="button" className="partnership-dialog-close" aria-label="Close partnership enquiry" onClick={() => setOpen(false)}>×</button>
      <h2 id="partnership-dialog-title" className="sr-only">Partnership enquiry</h2>
      <EnquiryForm kind="partner" modal defaultArea={defaultArea} />
    </section>
  </div>;
}
