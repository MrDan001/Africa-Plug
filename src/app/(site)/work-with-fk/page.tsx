import ContentPage from "@/components/layout/ContentPage";

const process = [
  { number: "01", title: "Tell us the brief", copy: "Share your business goal, the opportunity you are pursuing and the kind of support you need." },
  { number: "02", title: "Qualification & review", copy: "The brief is reviewed to understand fit, readiness, scope and the next sensible step." },
  { number: "03", title: "Agree the scope", copy: "Where there is a fit, the working scope, expectations, fees and terms are set out clearly." },
  { number: "04", title: "Move forward", copy: "Work begins once the scope and required arrangements have been agreed." },
];

export default function WorkWithFkPage() {
  return (
    <ContentPage
      eyebrow="AFRICA COMMERCIAL DEAL CONSULTANCY"
      title="WORK WITH FK."
      description="Commercial support for companies, investors, founders and institutions looking to assess, develop or progress opportunities connected to Africa."
      actionLabel="START WITH AN ENQUIRY"
      actionHref="/contact"
    >
      <div className="standard-section-heading">
        <p className="standard-eyebrow">A CLEAR PROCESS</p>
        <h2>From the first conversation to the next step.</h2>
        <p>Each engagement begins with a clear brief and a review of what is needed. Work, fees and terms are confirmed before an engagement proceeds.</p>
      </div>
      <div className="standard-process-list">
        {process.map((step) => (
          <article className="standard-process-step" key={step.number}>
            <span>{step.number}</span>
            <div><h3>{step.title}</h3><p>{step.copy}</p></div>
          </article>
        ))}
      </div>
      <div className="standard-cta-band">
        <div>
          <p className="standard-eyebrow">READY TO TALK?</p>
          <h2>Bring the brief. We’ll look at the next step.</h2>
          <p>Share a little context about your organisation, your goal and the support you are looking for.</p>
        </div>
        <a className="standard-button" href="/contact">Contact the team <span aria-hidden="true">↗</span></a>
      </div>
    </ContentPage>
  );
}
