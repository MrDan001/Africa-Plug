import ContentPage from "@/components/layout/ContentPage";
import EnquiryForm from "@/components/forms/EnquiryForm";
import { getPublicSiteSettings } from "@/lib/cms-bridge";

type Props = { searchParams: Promise<{ type?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const params = await searchParams;
  const requestedType = params.type;
  const kind = requestedType === "ask" ? "ask" : requestedType === "partner" ? "partner" : "contact";
  const settings = await getPublicSiteSettings();
  const pageCopy = kind === "ask"
    ? { eyebrow: "ASK THE AFRICA PLUG", title: "WHAT WOULD YOU LIKE TO UNDERSTAND?", description: "Ask about an African market, place, issue or opportunity. We review every question and may select yours for research, content or follow up." }
    : kind === "partner"
    ? { eyebrow: "PARTNER WITH TAP", title: "LET'S BUILD SOMETHING RELEVANT.", description: "Choose the kind of partnership you have in mind and tell us a little about the idea, audience or opportunity." }
    : { eyebrow: "CONTACT THE TEAM", title: "LET'S START A CONVERSATION.", description: "Tell us what you're working on, what you need clarity on or how you would like to work with The Africa Plug. We'll point your enquiry in the right direction." };

  const whatsappUrl = typeof settings.whatsappUrl === "string" && /^https:\/\//i.test(settings.whatsappUrl) ? settings.whatsappUrl : null;
  const linkedinUrl = typeof settings.linkedinUrl === "string" && /^https:\/\//i.test(settings.linkedinUrl) ? settings.linkedinUrl : null;

  return (
    <ContentPage eyebrow={pageCopy.eyebrow} title={pageCopy.title} description={pageCopy.description}>
      <div className="contact-official-email">
        <span className="contact-email-mark" aria-hidden="true">✉</span>
        <div>
          <p className="standard-eyebrow">OFFICIAL EMAIL</p>
          <a href="mailto:connect@theafricaplug.com">connect@theafricaplug.com</a>
          <p>Business, partnership, website and general enquiries.</p>
          <div className="contact-social-links">
            {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp ↗</a> : null}
            {linkedinUrl ? <a href={linkedinUrl} target="_blank" rel="noreferrer">LinkedIn ↗</a> : null}
          </div>
        </div>
      </div>
      <EnquiryForm kind={kind} />
    </ContentPage>
  );
}
