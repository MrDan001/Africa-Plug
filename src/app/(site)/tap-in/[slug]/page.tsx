import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findPublicOpportunityBySlug } from "@/lib/tap-in/opportunities";
import type { PublicListing } from "@/lib/tap-in/public";
import OpportunityInterestButton from "@/components/tap-in/OpportunityInterestButton";
import "@/components/tap-in/tap-in-page.css";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const opportunity = await findPublicOpportunityBySlug(slug);
  if (!opportunity || (opportunity.status !== "live" && opportunity.status !== "closed")) {
    return { title: "Opportunity not found" };
  }
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://theafricaplug.com").replace(/\/$/, "");
  const canonical = baseUrl + "/tap-in/" + encodeURIComponent(opportunity.slug);
  return {
    title: opportunity.seo_title || opportunity.title + " | T.A.P IN",
    description: opportunity.seo_description || opportunity.who_this_is_for || opportunity.description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: opportunity.seo_title || opportunity.title,
      description: opportunity.seo_description || opportunity.description,
      images: opportunity.share_image_url || opportunity.image_url ? [{ url: opportunity.share_image_url || opportunity.image_url || "" }] : [],
    },
  };
}

export default async function TapInOpportunityPage({ params }: Props) {
  const { slug } = await params;
  const opportunity = await findPublicOpportunityBySlug(slug);
  if (!opportunity || (opportunity.status !== "live" && opportunity.status !== "closed")) notFound();

  const listing: PublicListing = {
    id: opportunity.id,
    slug: opportunity.slug,
    title: opportunity.title,
    country: opportunity.country,
    region: opportunity.region,
    sector: opportunity.sector,
    opportunity_type: opportunity.opportunity_type,
    description: opportunity.description,
    who_this_is_for: opportunity.who_this_is_for,
    image_url: opportunity.image_url,
    open: opportunity.status === "live",
  };

  return (
    <main className="ti">
      <section className="ti-wrap mx-auto max-w-5xl px-6 py-14 md:py-20">
        <Link href="/tap-in" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-current opacity-75 hover:opacity-100">
          <span aria-hidden="true">←</span> ALL T.A.P IN OPPORTUNITIES
        </Link>
        <article className="mt-8 grid gap-8 md:grid-cols-[1.1fr_.9fr] md:items-start">
          <div>
            <p className="ti-label">{[opportunity.sector, opportunity.opportunity_type].filter(Boolean).join(" · ")}</p>
            <h1 className="mb-5 text-4xl font-semibold leading-tight md:text-5xl">{opportunity.title}</h1>
            <p className="mb-7 text-lg leading-relaxed opacity-80">{opportunity.description}</p>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider opacity-70">Who this is for</p>
            <p className="mb-8 leading-relaxed">{opportunity.who_this_is_for}</p>
            <p className="mb-8 text-sm font-medium opacity-75">{[opportunity.region, opportunity.country].filter(Boolean).join(" · ")}</p>
            {opportunity.status === "live"
              ? <OpportunityInterestButton listing={listing} />
              : <p className="rounded-xl border border-current/15 px-5 py-4 text-sm font-semibold">This opportunity is now closed and is no longer accepting expressions of interest.</p>}
          </div>
          {opportunity.image_url ? <div className="overflow-hidden rounded-2xl border border-current/10 bg-black/5"><img src={opportunity.image_url} alt={opportunity.title} className="h-full max-h-[560px] w-full object-cover" /></div> : null}
        </article>
        <p className="mt-12 max-w-3xl border-t border-current/15 pt-6 text-xs leading-relaxed opacity-65">
          Listings are shared for information only and are not an offer, recommendation or endorsement. Carry out your own due diligence before entering any agreement.
        </p>
      </section>
    </main>
  );
}
