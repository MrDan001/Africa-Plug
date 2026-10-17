import ContentPage from "@/components/layout/ContentPage";
import EnquiryForm from "@/components/forms/EnquiryForm";

export default function WorkWithFkApplyPage() {
  return (
    <ContentPage
      eyebrow="WORK WITH FK"
      title="LET’S UNDERSTAND YOUR BRIEF."
      description="Tell us about your organisation, target market, mandate, requirements and timeframe. The team reviews every application. This form does not take payment or confirm a meeting."
    >
      <div className="application-steps">
        <div><span>01</span><h2>Your context</h2><p>Who you are, what your organisation does and where the opportunity sits.</p></div>
        <div><span>02</span><h2>Your objective</h2><p>What you are trying to achieve, your timing and the help you are looking for.</p></div>
        <div><span>03</span><h2>Review & next steps</h2><p>If the brief is a fit, the team can outline the next steps and relevant terms.</p></div>
      </div>
      <EnquiryForm kind="work" />
      <p className="standard-disclaimer">The full agreed sequence is Application → Review → Approval → Deposit or Invoice → Private Scheduler → Balance Payment → Meeting. Payment, scheduler access and transactional emails remain disabled until the relevant provider accounts and final commercial/legal terms are configured and end-to-end tested.</p>
    </ContentPage>
  );
}
