// FILE PATH: src/app/(site)/tap-in/page.tsx
import type { Metadata } from "next";
import TapInBoard from "@/components/tap-in/TapInBoard";
import { listAllOpportunities } from "@/lib/tap-in/opportunities";
import type { PublicListing } from "@/lib/tap-in/public";
import "@/components/tap-in/tap-in-page.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "T.A.P IN | Business and Investment Opportunities Across Africa | The Africa Plug" },
  description: "Live business and investment opportunities across Africa. Find one or put yours forward, and TAP makes the introduction.",
  alternates: { canonical: "/tap-in" },
};

export default async function TapInPage() {
  const all = await listAllOpportunities().catch(() => []);
  // Open (live) and Closed listings show. Drafts and archived records never do. Newest first.
  const listings: PublicListing[] = all
    .filter((item) => item.status === "live" || item.status === "closed")
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      country: item.country,
      sector: item.sector,
      opportunity_type: item.opportunity_type,
      description: item.description,
      who_this_is_for: item.who_this_is_for,
      image_url: item.image_url,
      open: item.status === "live",
    }));

  return (
    <div className="ti">
      <section className="ti-hero" aria-labelledby="ti-h1">
        <div className="ti-hero-img" aria-hidden="true" />
        <div className="ti-wrap ti-hero-inner">
          <p className="ti-label">LIVE BUSINESS AND INVESTMENT OPPORTUNITIES</p>
          <h1 id="ti-h1" className="text-white">TAP IN.</h1>
          <p className="ti-hero-sub text-gray-200">
            Business and investment opportunities across Africa.<br />
            Find one or put yours forward, and TAP makes the introduction.
          </p>
        </div>
      </section>
      <TapInBoard listings={listings} />
    </div>
  );
}