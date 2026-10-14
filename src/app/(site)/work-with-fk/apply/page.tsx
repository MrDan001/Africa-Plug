import ContentPage from "@/components/layout/ContentPage";
import EnquiryForm from "@/components/forms/EnquiryForm";

export default function WorkWithFkApplyPage() {
  return (
    <ContentPage
      eyebrow="WORK WITH FK"
      title="LET’S UNDERSTAND YOUR BRIEF."
      description="Tell us about your organisation, objectives and the commercial support you need. The team will review your enquiry and respond with the appropriate next step."
    >
      <div className="application-steps">
        <div><span>01</span><h2>Your context</h2><p>Who you are, what your organisation does and where the opportunity sits.</p></div>
        <div><span>02</span><h2>Your objective</h2><p>What you are trying to achieve, your timing and the help you are looking for.</p></div>
        <div><span>03</span><h2>Review & next steps</h2><p>If the brief is a fit, the team can outline the next steps and relevant terms.</p></div>
      </div>
      <EnquiryForm kind="work" />
      <p className="standard-disclaimer">This is an initial enquiry only. No deposit or meeting payment is collected here. The payment process will only be enabled after the required terms have been legally reviewed.</p>
    </ContentPage>
  );
}
