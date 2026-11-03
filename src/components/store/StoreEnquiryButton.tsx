"use client";

import { useEffect, useState } from "react";
import EnquiryForm from "@/components/forms/EnquiryForm";

export default function StoreEnquiryButton({ title, className = "store-product-cta" }: { title: string; className?: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const keydown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", keydown);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", keydown); document.body.style.overflow = ""; };
  }, [open]);
  return <>
    <button type="button" className={className} onClick={() => setOpen(true)}>ENQUIRE NOW <span aria-hidden="true">→</span></button>
    {open ? <div className="store-enquiry-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="store-enquiry-modal" role="dialog" aria-modal="true" aria-label={`Enquire about ${title}`}>
        <button type="button" className="store-enquiry-close" aria-label="Close enquiry" onClick={() => setOpen(false)}>×</button>
        <EnquiryForm kind="contact" modal storeEnquiryTitle={title} opportunityName={title} />
      </section>
    </div> : null}
  </>;
}
