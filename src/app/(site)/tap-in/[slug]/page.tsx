import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContentPage from "@/components/layout/ContentPage";
import { findPublicOpportunityBySlug, listLiveOpportunities } from "@/lib/tap-in/opportunities";
import ExpressionOfInterestForm from "@/components/tap-in/ExpressionOfInterestForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await findPublicOpportunityBySlug(slug).catch(() => null);
  if (!item) return { title: "Opportunity | TAP IN" };
  return {
    title: item.seo_title || `${item.title} | TAP IN — The Africa Plug`,
    description: item.seo_description || item.who_this_is_for,
    openGraph: {
      title: item.seo_title || item.title,
      description: item.seo_description || item.who_this_is_for,
      images: item.share_image_url ? [item.share_image_url] : item.image_url ? [item.image_url] : [],
    },
  };
}

export default async function TapInOpportunityPage({ params }: Props) {
  const { slug } = await params;
  const opportunity = await findPublicOpportunityBySlug(slug).catch(() => null);
  if (!opportunity) notFound();

  const acceptingInterest = opportunity.status === "live";
  const otherOpportunities = acceptingInterest
    ? (await listLiveOpportunities().catch(() => [])).filter((item) => item.slug !== opportunity.slug).slice(0, 3)
    : await listLiveOpportunities().catch(() => []);

  return (
    <ContentPage
      eyebrow={opportunity.sector}
      title={opportunity.title}
      description={opportunity.description}
      actionLabel="VIEW CURRENT OPPORTUNITIES"
      actionHref="/tap-in"
    >
      {opportunity.image_url ? (
        <div
          role="img"
          aria-label={`${opportunity.title} opportunity image`}
          className="standard-note"
          style={{
            display: "block",
            padding: 0,
            minHeight: 180,
            maxHeight: 460,
            aspectRatio: "16 / 7",
            overflow: "hidden",
            backgroundImage: `url("${opportunity.image_url}")`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        />
      ) : null}

      <div className="standard-section-heading">
        <p className="standard-eyebrow">{[opportunity.country, opportunity.region, opportunity.opportunity_type].filter(Boolean).join(" · ")}</p>
        <h2>Who this is for</h2>
        <p>{opportunity.who_this_is_for}</p>
      </div>

      {!acceptingInterest ? (
        <div className="standard-note">
          <span className="standard-note-mark" aria-hidden="true">↗</span>
          <div>
            <h3>This opportunity is no longer accepting expressions of interest.</h3>
            <p>Explore current opportunities to find another suitable opening.</p>
          </div>
          <a href="/tap-in">Current opportunities <span aria-hidden="true">→</span></a>
        </div>
      ) : (
        <div className="standard-note">
          <span className="standard-note-mark" aria-hidden="true">↗</span>
          <div>
            <h3>Interested in this opportunity?</h3>
            <p>Contact the team with the listing title so your enquiry can be directed to the right opportunity.</p>
          </div>
          <a href={`mailto:connect@theafricaplug.com?subject=${encodeURIComponent(`TAP IN enquiry: ${opportunity.title}`)}`}>Contact TAP <span aria-hidden="true">→</span></a>
        </div>
      )}

      {acceptingInterest ? (
        <ExpressionOfInterestForm
          slug={opportunity.slug}
          listingTitle={opportunity.title}
          questions={opportunity.enquiry_questions}
        />
      ) : null}

      {otherOpportunities.length ? (
        <>
          <div className="standard-section-heading">
            <p className="standard-eyebrow">MORE TO EXPLORE</p>
            <h2>Current opportunities</h2>
          </div>
          <div className="standard-card-grid">
            {otherOpportunities.map((item) => (
              <article className="standard-card" key={item.id}>
                <p className="standard-card-category">{[item.sector, item.opportunity_type].filter(Boolean).join(" · ")}</p>
                <h3>{item.title}</h3>
                <p>{item.who_this_is_for}</p>
                <a className="text-link" href={`/tap-in/${item.slug}`}>View opportunity <span aria-hidden="true">→</span></a>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </ContentPage>
  );
}
