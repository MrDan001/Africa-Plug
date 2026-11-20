"use client";

import { usePathname } from "next/navigation";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://theafricaplug.com").replace(/\/$/, "");
const LABELS: Record<string, string> = {
  "work-with-fk": "Work With FK",
  apply: "Apply",
  call: "Call with FK",
  store: "Store",
  "pet-travel-consultation": "Pet Travel Consultation",
  "explore-africa-like-an-insider": "Explore Africa Like an Insider",
  "the-unwritten-rules-of-doing-business-in-africa": "The Unwritten Rules of Doing Business in Africa",
  "tap-in": "T.A.P IN",
  about: "About",
  blog: "Blog",
  contact: "Contact",
  privacy: "Privacy Policy",
  refunds: "Refunds Policy",
  terms: "Terms",
  cookies: "Cookie Policy",
};

export default function BreadcrumbJsonLd() {
  const pathname = usePathname() || "/";
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = [{ name: "Home", url: SITE_URL }];
  let path = "";
  for (const segment of segments) {
    path += "/" + segment;
    const name = LABELS[segment] || decodeURIComponent(segment).replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    crumbs.push({ name, url: SITE_URL + path });
  }
  const payload = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload).replace(/</g, "\\u003c") }} />;
}
