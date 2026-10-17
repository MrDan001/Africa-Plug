import ContentPage from "@/components/layout/ContentPage";

const process = [
  { number: "01", title: "Application", copy: "Share your organisation, target market, mandate, requirements and timeframe." },
  { number: "02", title: "Review", copy: "The team reviews the application for fit, scope, readiness and relevant next steps." },
  { number: "03", title: "Approval or decline", copy: "You receive a decision. Approval means the application can proceed to the commercial stage; it is not yet a booked meeting." },
  { number: "04", title: "Deposit or invoice", copy: "After fees and terms are confirmed, the approved applicant receives the agreed payment or company-invoice instructions." },
  { number: "05", title: "Private scheduler", copy: "Scheduling access is released only after the required deposit or invoiced payment is verified." },
  { number: "06", title: "Balance payment", copy: "Any remaining agreed meeting fee is settled under the confirmed payment and cancellation terms." },
  { number: "07", title: "Meeting", copy: "The meeting is confirmed after the required payment and scheduling steps are complete." },
];

export default function WorkWithFkPage() {
  return (
    <ContentPage
      eyebrow="AFRICA COMMERCIAL DEAL CONSULTANCY"
      title="WORK WITH FK."
      description="Commercial support for companies, investors, founders and institutions looking to assess, develop or progress opportunities connected to Africa."
      actionLabel="START YOUR ENQUIRY"
      actionHref="/work-with-fk/apply"
    >
      <div className="standard-section-heading">
        <p className="standard-eyebrow">A CLEAR PROCESS</p>
        <h2>From application to meeting.</h2>
        <p>The intended journey is application, review, approval, deposit or invoice, private scheduler, balance payment and meeting. The paid booking and scheduler stages are not active until payment, scheduling and commercial terms have been configured and tested.</p>
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
          <h2>Start with the brief.</h2>
          <p>Share your organisation, target market and commercial objectives. Submitting the form does not approve an engagement or trigger a payment.</p>
        </div>
        <a className="standard-button" href="/work-with-fk/apply">START YOUR ENQUIRY <span aria-hidden="true">↗</span></a>
      </div>
    </ContentPage>
  );
}
