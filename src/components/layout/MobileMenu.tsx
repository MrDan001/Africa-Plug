"use client";

import { useEffect, useState } from "react";

type NavItem = { label: string; href: string };

export default function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="mobile-menu-trigger"
      >
        {open ? (
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="m5 5 14 14M19 5 5 19" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M3 6.5h18M3 12h18M3 17.5h18" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div id="mobile-menu" className="mobile-menu-panel">
          <nav aria-label="Mobile navigation">
            <ul>
              {items.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="mobile-menu-link"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
