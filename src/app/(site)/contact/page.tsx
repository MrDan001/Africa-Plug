import ContentPage from "@/components/layout/ContentPage";

export default function ContactPage() {
  return (
    <ContentPage
      eyebrow="CONTACT THE TEAM"
      title="LET’S START A CONVERSATION."
      description="Tell us what you’re working on, what you need clarity on or how you would like to work with The Africa Plug. We’ll point your enquiry in the right direction."
    >
      <div className="contact-option-grid">
        <a className="contact-option-card" href="mailto:connect@theafricaplug.com">
          <p className="standard-eyebrow">BUSINESS & PARTNERSHIPS</p>
          <h2>Connect with TAP</h2>
          <p>Commercial relationships, partnership ideas and general business enquiries.</p>
          <span>connect@theafricaplug.com <b aria-hidden="true">↗</b></span>
        </a>
        <a className="contact-option-card" href="mailto:ask@theafricaplug.com">
          <p className="standard-eyebrow">QUESTIONS & GUIDANCE</p>
          <h2>Ask The Africa Plug</h2>
          <p>Questions about the platform, resources or where to find more information.</p>
          <span>ask@theafricaplug.com <b aria-hidden="true">↗</b></span>
        </a>
      </div>
      <div className="standard-note">
        <span className="standard-note-mark" aria-hidden="true">i</span>
        <div>
          <h3>Help us get you to the right person.</h3>
          <p>Include your name, organisation (if relevant), location and a short summary of your enquiry.</p>
        </div>
      </div>
    </ContentPage>
  );
}
