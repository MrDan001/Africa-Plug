import ContentPage from "@/components/layout/ContentPage";

const values = [
  { number: "01", title: "Clarity", copy: "Make the opportunity, the process and the next step easier to understand." },
  { number: "02", title: "Connection", copy: "Bring the right people, ideas and commercial interests into the same conversation." },
  { number: "03", title: "Context", copy: "Look beyond the headline and understand the conditions around an opportunity." },
];

export default function AboutPage() {
  return (
    <ContentPage
      eyebrow="ABOUT THE AFRICA PLUG"
      title="A CONNECTION TO WHAT’S MOVING."
      description="The Africa Plug is the commercial home of FK’s Africa Commercial Deal Consultancy — connecting people and businesses with opportunities, useful context and potential partners across the continent."
      actionLabel="WORK WITH FK"
      actionHref="/work-with-fk"
    >
      <div className="about-statement">
        <p className="standard-eyebrow">OUR PURPOSE</p>
        <h2>Not just finding opportunities. Helping people move towards them.</h2>
        <p>Through commercial consultancy, opportunity listings and partnerships, the aim is to make useful connections clearer and more actionable. The site is designed to help visitors understand what is available and how to take the next step.</p>
      </div>
      <div className="standard-card-grid">
        {values.map((value) => (
          <article className="standard-card" key={value.number}>
            <span className="standard-card-number">{value.number}</span>
            <h3>{value.title}</h3>
            <p>{value.copy}</p>
          </article>
        ))}
      </div>
      <div className="standard-cta-band" id="partner">
        <div>
          <p className="standard-eyebrow">PARTNER WITH TAP</p>
          <h2>Have something meaningful to build together?</h2>
          <p>We welcome conversations with brands, sponsors, event organisers, guests and organisations whose work fits the platform.</p>
        </div>
        <a className="standard-button" href="mailto:connect@theafricaplug.com?subject=Partner%20with%20TAP">Explore a partnership <span aria-hidden="true">↗</span></a>
      </div>
    </ContentPage>
  );
}
