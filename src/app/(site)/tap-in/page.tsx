import ContentPage from "@/components/layout/ContentPage";
import { listLiveOpportunities } from "@/lib/tap-in/opportunities";

export const dynamic = "force-dynamic";

export default async function TapInPage() {
  // No sample cards: only genuinely published records are shown.
  const opportunities = await listLiveOpportunities().catch(() => []);

  return (
    <ContentPage
      eyebrow="LIVE BUSINESS & INVESTMENT OPPORTUNITIES"
      title="TAP IN."
      description="Explore current business and investment opportunities across Africa. Each listing is shared only when its details are approved for publication."
      actionLabel="ASK ABOUT OPPORTUNITIES"
      actionHref="/contact"
    >
      <div className="standard-section-heading">
        <p className="standard-eyebrow">CURRENT OPPORTUNITIES</p>
        <h2>Where business meets possibility.</h2>
        <p>Only opportunities marked live after review are shown here. Public listing cards do not display posting dates or internal status labels.</p>
      </div>

      {opportunities.length ? (
        <div className="standard-card-grid">
          {opportunities.map((item) => (
            <article className="standard-card" key={item.id}>
              <p className="standard-card-category">{[item.sector, item.opportunity_type].filter(Boolean).join(" · ")}</p>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              {item.country || item.region ? (
                <p className="standard-card-category">{[item.country, item.region].filter(Boolean).join(" · ")}</p>
              ) : null}
              <p><strong>Who this is for:</strong> {item.who_this_is_for}</p>
              <a className="text-link" href={`/tap-in/${item.slug}`}>View opportunity <span aria-hidden="true">→</span></a>
            </article>
          ))}
        </div>
      ) : (
        <div className="standard-note">
          <span className="standard-note-mark" aria-hidden="true">↗</span>
          <div>
            <h3>No current opportunities to display.</h3>
            <p>Please check back soon. Listings will appear here when genuine opportunities have been reviewed and approved for publication.</p>
          </div>
          <a href="/contact">Contact TAP <span aria-hidden="true">→</span></a>
        </div>
      )}

      <div className="standard-note">
        <span className="standard-note-mark" aria-hidden="true">↗</span>
        <div>
          <h3>Have an opportunity to put forward?</h3>
          <p>Send the team a concise overview, location and the kind of partner you are looking for.</p>
        </div>
        <a href="mailto:connect@theafricaplug.com?subject=Opportunity%20enquiry">Contact TAP <span aria-hidden="true">→</span></a>
      </div>
    </ContentPage>
  );
}
