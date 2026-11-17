"use client";

import { useState } from "react";
import type { PublicListing } from "@/lib/tap-in/public";
import { ExpressInterestDialog } from "@/components/tap-in/TapInDialogs";

export default function OpportunityInterestButton({ listing }: { listing: PublicListing }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="ti-btn ti-btn-primary" onClick={() => setOpen(true)}>
        EXPRESS INTEREST <span aria-hidden="true">→</span>
      </button>
      {open ? <ExpressInterestDialog listing={listing} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
