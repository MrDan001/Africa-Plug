import ContentPage from "@/components/layout/ContentPage";
import EnquiryForm from "@/components/forms/EnquiryForm";

export default function ContactPage() {
  return (
    <ContentPage
      eyebrow="CONTACT THE TEAM"
      title="LET’S START A CONVERSATION."
      description="Tell us what you’re working on, what you need clarity on or how you would like to work with The Africa Plug. We’ll point your enquiry in the right direction."
    >
      <div className="contact-official-email">
        <span className="contact-email-mark" aria-hidden="true">✉</span>
        <div>
          <p className="standard-eyebrow">OFFICIAL EMAIL</p>
          <a href="mailto:connect@theafricaplug.com">connect@theafricaplug.com</a>
          <p>Business, partnership, website and general enquiries.</p>
        </div>
      </div>
      <EnquiryForm kind="contact" />
    </ContentPage>
  );
}
