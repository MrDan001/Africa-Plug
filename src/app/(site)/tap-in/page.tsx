import ContentPage from "@/components/layout/ContentPage";

const opportunityAreas = [
  {
    number: "01",
    category: "EQUIPMENT & INFRASTRUCTURE",
    title: "Equipment hire",
    copy: "Commercial equipment needs and supply opportunities, including construction and infrastructure support.",
  },
  {
    number: "02",
    category: "AGRICULTURE & SUPPLY",
    title: "Agricultural trade",
    copy: "Supply, sourcing and distribution opportunities connecting producers, buyers and commercial partners.",
  },
  {
    number: "03",
    category: "ENERGY & EMERGING SECTORS",
    title: "Growth projects",
    copy: "A place for relevant projects and partnerships to be presented when their details are ready to share.",
  },
];

export default function TapInPage() {
  return (
    <ContentPage
      eyebrow="DISCOVER OPPORTUNITY"
      title="TAP IN."
      description="A clearer view of business and investment opportunities across Africa. Explore the areas we are preparing to connect, then get in touch if you have a specific brief."
      actionLabel="ASK ABOUT OPPORTUNITIES"
      actionHref="/contact"
    >
      <div className="standard-section-heading">
        <p className="standard-eyebrow">OPPORTUNITY WATCH</p>
        <h2>Where business meets possibility.</h2>
        <p>Listings will be published here as individual opportunities are confirmed and ready to share. The cards below show the focus areas for this section, not live or verified listings.</p>
      </div>
      <div className="standard-card-grid">
        {opportunityAreas.map((item) => (
          <article className="standard-card" key={item.number}>
            <span className="standard-card-number">{item.number}</span>
            <p className="standard-card-category">{item.category}</p>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </article>
        ))}
      </div>
      <div className="standard-note">
        <span className="standard-note-mark" aria-hidden="true">↗</span>
        <div>
          <h3>Have an opportunity to put forward?</h3>
          <p>Contact the team with a concise overview, location and the kind of partner you are looking for.</p>
        </div>
        <a href="mailto:connect@theafricaplug.com?subject=Opportunity%20enquiry">Contact TAP <span aria-hidden="true">→</span></a>
      </div>
    </ContentPage>
  );
}
