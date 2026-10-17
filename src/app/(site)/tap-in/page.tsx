import ContentPage from "@/components/layout/ContentPage";
import TapInListings from "@/components/tap-in/TapInListings";
import { listLiveOpportunities } from "@/lib/tap-in/opportunities";
import { getPublicSiteSettings } from "@/lib/cms-bridge";

export const dynamic = "force-dynamic";

export default async function TapInPage() {
  const [opportunities, settings] = await Promise.all([
    listLiveOpportunities().catch(() => []),
    getPublicSiteSettings(),
  ]);
  const threshold = settings.tapInFilterThreshold ?? 6;

  return (
    <ContentPage
      eyebrow="LIVE BUSINESS & INVESTMENT OPPORTUNITIES"
      title="TAP IN."
      description="Explore current business and investment opportunities across Africa. Each listing is shared only when its details are approved for publication."
    >
      <div className="standard-section-heading">
        <p className="standard-eyebrow">CURRENT OPPORTUNITIES</p>
        <h2>Where business meets possibility.</h2>
        <p>Only approved live opportunities appear here. Public listing cards do not display posting dates or internal status labels.</p>
      </div>
      <TapInListings opportunities={opportunities} filterThreshold={threshold} />
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
