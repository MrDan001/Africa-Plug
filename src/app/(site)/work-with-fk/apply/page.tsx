import ContentPage from "@/components/layout/ContentPage";

export default function WorkWithFkApplyPage() {
  return (
    <ContentPage
      eyebrow="WORK WITH FK"
      title="LET’S UNDERSTAND YOUR BRIEF."
      description="The online qualification and application flow is being prepared. For now, start with a short enquiry so the team can understand your organisation, objectives and the support you need."
      actionLabel="CONTACT THE TEAM"
      actionHref="/contact"
    >
      <div className="application-steps">
        <div><span>01</span><h2>Your context</h2><p>Who you are, what your organisation does and where the opportunity sits.</p></div>
        <div><span>02</span><h2>Your objective</h2><p>What you are trying to achieve, your timing and the help you are looking for.</p></div>
        <div><span>03</span><h2>Review & next steps</h2><p>If the brief is a fit, the team can outline the next steps and relevant terms.</p></div>
      </div>
      <p className="standard-disclaimer">No deposit or meeting payment is collected on this page. The payment process will only be enabled after the terms have been reviewed.</p>
    </ContentPage>
  );
}
