// FILE PATH: src/components/layout/LegalPages.tsx
import Link from "next/link";

type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
};

function LegalPage({ eyebrow, title, intro, sections }: LegalPageProps) {
  return (
    <article className="legal-page">
      <div className="legal-page-shell">
        <Link href="/" className="legal-page-back">
          <span aria-hidden="true">←</span> The Africa Plug
        </Link>
        <p className="legal-page-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="legal-page-intro">{intro}</p>
        <div className="legal-page-meta">
          <span>Effective date: 30 November 2026</span>
          <span>Last reviewed: 30 November 2026</span>
        </div>
        <div className="legal-page-sections">
          {sections.map((section) => (
            <section className="legal-page-section" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              {section.bullets?.length ? <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
            </section>
          ))}
        </div>
        <div className="legal-page-contact">
          <h2>Questions?</h2>
          <p>Email <a href="mailto:connect@theafricaplug.com">connect@theafricaplug.com</a>. Please do not send full payment card details.</p>
        </div>
      </div>
    </article>
  );
}

export function RefundPolicy() {
  const sections: LegalSection[] = [
    { heading: "1. Digital products", paragraphs: [
      "Our guides, ebooks and other digital products are downloads, available straight after purchase or, for a preorder, on release. At checkout, you’ll be asked to request immediate access and to confirm you understand that this ends your 14 day right to cancel. Once a digital product has been downloaded or accessed, we don’t offer refunds. You can cancel a preorder for a full refund at any time before the guide is released.",
      "If a digital product is faulty, can’t be accessed or is materially different from its description, email us and we’ll fix the problem or refund you, as the law requires."
    ]},
    { heading: "2. Calls, consultations and booked services", paragraphs: [
      "You can cancel within 14 days of booking for a full refund, as long as your session hasn’t taken place. If your session is within those 14 days, you’ll be asked to confirm you want it to go ahead early, and that you lose the right to cancel once it has taken place.",
      "Rescheduling: one free reschedule with at least 48 hours’ notice.",
      "Missed sessions: a session missed without 48 hours’ notice can’t be refunded or rescheduled.",
      "Credits: where a fee can be credited against a later service, the credit is valid for the period stated at booking and can’t be exchanged for cash."
    ]},
    { heading: "3. Commercial consulting", paragraphs: [
      "This covers the Deal Diagnostic and consulting engagements for businesses. Fees, payment, cancellation and rescheduling terms are set out in your approval email or proposal and agreed before you pay. Unless agreed otherwise, you get one free reschedule with at least 48 hours’ notice, and fees aren’t refundable for cancellations within 48 hours of a session or for a missed session."
    ]},
    { heading: "4. How to cancel or request a refund", paragraphs: [
      "Email connect@theafricaplug.com with your name, booking or order reference, what you bought, the date and your reason. Please don’t send card details. Approved refunds go back to your original payment method within 14 days."
    ]},
    { heading: "5. Your statutory rights", paragraphs: ["Nothing in this policy affects your statutory rights."] }
  ];
  return <LegalPage eyebrow="ORDERS AND CANCELLATIONS" title="REFUNDS POLICY" intro="How cancellations and refunds work for our digital products, consultations and consulting services." sections={sections} />;
}

export function PrivacyPolicy() {
  const sections: LegalSection[] = [
    { heading: "1. Who we are", paragraphs: ["The Africa Plug has offices in Victoria Island, Lagos, Nigeria and London, United Kingdom. For any privacy question, email connect@theafricaplug.com."] },
    { heading: "2. What we collect", paragraphs: [
      "Enquiries and applications: your name, email, company, role, country, phone number if given, and what you tell us in a form, including Work With FK applications and T.A.P IN submissions or expressions of interest.",
      "Purchases and bookings: what you bought or booked, the date, and your billing details. Card payments are handled by Stripe; we never see or store your full card number.",
      "Digital products: when your download link was opened, so we can manage access and refund requests.",
      "Email updates: your email address if you sign up for T.A.P IN opportunity alerts, new blog articles, a product waitlist or general updates.",
      "Technical information: your IP address, browser, device, pages visited and similar data recorded by our hosting and security services.",
      "Cookie choices: whether you accepted or declined optional analytics."
    ]},
    { heading: "3. Why we use it", paragraphs: [
      "To respond to enquiries, assess applications, deliver products and services, take payments, send updates you asked for, keep the site secure and meet our legal obligations. Under UK and Nigerian data protection law, our legal grounds are: taking steps at your request before a contract, performing a contract, our legitimate interest in running the business, your consent where needed, and legal obligations."
    ]},
    { heading: "4. Who we share it with", paragraphs: ["We never sell your information. We share only what’s needed with the services that run the site:"], bullets: [
      "Vercel (hosting)", "Resend (email)", "Cloudflare Turnstile (spam protection)", "Stripe (payments)",
      "Google (calendar bookings, invites and video calls)"
    ]},
    { heading: "5. T.A.P IN", paragraphs: ["When you express interest in an opportunity, we don’t pass your details to the lister automatically. We review interest and make introductions ourselves, with your agreement."] },
    { heading: "6. International transfers", paragraphs: ["Some of these services process data outside your country. Where the law requires it, we use appropriate safeguards, such as approved contract terms."] },
    { heading: "7. How long we keep it", paragraphs: [
      "Enquiries and applications: up to 24 months after our last contact.",
      "Purchase, booking and payment records: as long as tax and accounting law requires.",
      "Email updates: until you unsubscribe."
    ]},
    { heading: "8. Security", paragraphs: ["We use reasonable measures to protect your information, though no system is completely secure. Please don’t send card details, passwords or sensitive documents by email."] },
    { heading: "9. Your rights", paragraphs: [
      "You can ask to access, correct or delete your information, object to or restrict how we use it, receive a copy, or withdraw consent. Email connect@theafricaplug.com; we may need to confirm your identity. You can also complain to the Information Commissioner’s Office in the UK, the Nigeria Data Protection Commission, or the regulator where you live."
    ]},
    { heading: "10. Children", paragraphs: ["Our services are for adults and businesses. We don’t knowingly collect information from anyone under 18."] },
    { heading: "11. Other websites and changes", paragraphs: ["Links to other websites are covered by their own privacy policies. We’ll update this policy as our services change, and the date above shows the current version."] }
  ];
  return <LegalPage eyebrow="YOUR INFORMATION" title="PRIVACY POLICY" intro="How The Africa Plug handles your personal information." sections={sections} />;
}

export function TermsOfUse() {
  const sections: LegalSection[] = [
    { heading: "1. About these terms", paragraphs: ["This website is run by The Africa Plug, with offices in Victoria Island, Lagos, Nigeria and London, United Kingdom. By using the site, you agree to these terms. If you don't agree, please don't use the site."] },
    { heading: "2. Information, not advice", paragraphs: ["Our content covers business, investment, culture, travel and opportunities across Africa, for general information only. It isn't legal, tax, financial, investment or other regulated advice. Markets and rules change, so check important facts and take qualified advice before committing money, signing a contract or entering a market. We don't promise that any opportunity, introduction or result will be available, suitable or successful."] },
    { heading: "3. T.A.P IN", paragraphs: ["T.A.P IN listings are shared for information only and are not an offer, recommendation or endorsement. We don't guarantee the accuracy of any listing or the people behind it. Carry out your own due diligence before entering any agreement. Submitting or expressing interest in an opportunity doesn't commit either side, and any introduction is made at our discretion."] },
    { heading: "4. Enquiries, applications and services", paragraphs: ["Sending an enquiry or application doesn't create a client relationship or commit either side. We may ask for more information or decline. Paid services, including calls, the Deal Diagnostic and consulting engagements, are governed by the terms agreed at booking or in writing before work begins. Please only share information you have permission to share. Questions sent through Ask The Africa Plug may be used as the starting point for our research and content, without your name or any detail that identifies you."] },
    { heading: "5. Purchases and digital products", paragraphs: ["Prices, currency and what's included are shown before you pay. Payments are processed securely by Stripe. When you buy a guide or other digital product, you get a personal licence to use it for yourself or your own business. You may not share, resell, copy or publish it, in whole or in part. Preorders are paid when you order and delivered when the guide is released. Cancellations and refunds are covered by our Refunds Policy."] },
    { heading: "6. Using the site properly", paragraphs: ["Don't misuse the site, interfere with how it works, attempt unauthorised access, introduce harmful code, collect other people's information, send abusive or unlawful submissions, or break any law in using it."] },
    { heading: "7. Our content and brand", paragraphs: ["The site's text, designs, graphics, guides and The Africa Plug name and logo belong to us or our licensors. You may view and print reasonable parts for personal or internal business reference. You may not copy, republish, sell or adapt them commercially, or use our brand to suggest our endorsement, without written permission. Other companies' names and marks belong to their owners."] },
    { heading: "8. Other websites", paragraphs: ["Links to other websites are provided for convenience. We don't control them and aren't responsible for their content, security or privacy practices."] },
    { heading: "9. Our responsibility", paragraphs: ["Nothing in these terms limits liability where the law doesn't allow it, or affects your statutory rights. Otherwise, the site and its general information are provided as they are, and you remain responsible for your own decisions. Liability for paid services is governed by the terms agreed for that service."] },
    { heading: "10. Privacy, cookies and refunds", paragraphs: ["Please read our Privacy Policy, Cookie Policy and Refunds Policy alongside these terms."] },
    { heading: "11. Changes and governing law", paragraphs: ["We may update these terms as the site and our services change; the date above shows the current version. These terms are governed by the law of England and Wales, without removing any consumer protections that apply where you live. If any part is found unenforceable, the rest still applies."] }
  ];
  return <LegalPage eyebrow="USING THIS WEBSITE" title="TERMS OF USE" intro="The terms for using The Africa Plug website, its forms, T.A.P IN and the Store." sections={sections} />;
}

export function CookiePolicy() {
  const sections: LegalSection[] = [
    { heading: "1. What cookies are", paragraphs: ["Cookies are small files your browser stores when you visit a website. Similar technologies, like local storage, work in a similar way. We call them all “cookies” here."] },
    { heading: "2. The cookies we use", paragraphs: [
      "Essential: Keeps the site secure, protects forms from spam (Cloudflare Turnstile), processes payments safely (Stripe) and remembers your cookie choice. Always on, as the site can’t work properly without them.",
      "Analytics: We don't use analytics cookies at present. If we add an analytics tool, we'll name it here and only set it if you accept.",
      "Embedded content: Videos from YouTube may set their own cookies when you play them. Only loaded if you accept, or when you choose to use them.",
      "We don’t use advertising cookies."
    ]},
    { heading: "3. Changing your choice", paragraphs: ["When you first visit, you can accept or decline optional cookies. You can change your choice at any time using the Cookie settings link at the bottom of every page. You can also block or delete cookies in your browser settings, though some features may not work properly."] },
    { heading: "4. Other providers", paragraphs: ["Stripe and YouTube set cookies under their own policies, which we encourage you to read."] },
    { heading: "5. Changes", paragraphs: ["We’ll update this policy if the cookies we use change. The date above shows the current version."] }
  ];
  return <LegalPage eyebrow="DEVICE PREFERENCES" title="COOKIE POLICY" intro="How The Africa Plug uses cookies and similar technologies." sections={sections} />;
}
