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
  notice: string;
  sections: LegalSection[];
};

function LegalPage({ eyebrow, title, intro, notice, sections }: LegalPageProps) {
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
          <span>Effective date: 14 October 2026</span>
          <span>Last reviewed: 14 October 2026</span>
        </div>
        <p className="legal-page-notice">{notice}</p>
        <div className="legal-page-sections">
          {sections.map((section) => (
            <section className="legal-page-section" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs?.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
              {section.bullets?.length ? (
                <ul>
                  {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
        <div className="legal-page-contact">
          <h2>Questions about this policy?</h2>
          <p>
            Contact The Africa Plug at{" "}
            <a href="mailto:connect@theafricaplug.com">connect@theafricaplug.com</a>.
            Please do not send full payment-card details or sensitive identity documents by email.
          </p>
        </div>
      </div>
    </article>
  );
}

export function PrivacyPolicy() {
  const sections: LegalSection[] = [
    {
      heading: "1. Who we are and what this policy covers",
      paragraphs: [
        "The Africa Plug (referred to as “The Africa Plug”, “we”, “us” or “our”) operates this website and its public pages. This policy explains how we handle personal information when you browse the website, contact us, submit an enquiry or use a feature described here.",
        "For data-protection questions, contact connect@theafricaplug.com. The precise contracting legal entity and registered business address must be shown in the relevant business documents and completed here before paid services launch; this website does not invent those details."
      ]
    },
    {
      heading: "2. Information we may collect",
      paragraphs: [
        "The information we receive depends on how you interact with the website. We aim to collect only information reasonably relevant to the enquiry or service."
      ],
      bullets: [
        "Contact and enquiry details: name, email address, organisation, role, country, phone number if supplied, and the message or information you choose to send.",
        "Opportunity or service enquiry details: the market, project, requirements, experience, timing, budget range or other answers you include in a form.",
        "Communications: information in emails and follow-up correspondence so that we can understand and respond to a request.",
        "Technical information: information that hosting, security and delivery services may record, such as IP address, browser/device information, requested pages, timestamps, referrer information and diagnostic logs.",
        "Preference information: your choice to accept or reject optional analytics storage through the site privacy banner."
      ]
    },
    {
      heading: "3. Why we use information and our legal grounds",
      paragraphs: [
        "Depending on the context and applicable law, we process personal information to respond to requests, provide information you ask for, assess enquiries, maintain security, troubleshoot the site, keep appropriate records and meet legal obligations.",
        "Where UK GDPR applies, the relevant legal ground may be taking steps at your request before entering a contract, performing a contract, our legitimate interests in operating and securing the website and responding to business enquiries, consent where required, or compliance with a legal obligation. We consider the purpose and impact before relying on legitimate interests."
      ]
    },
    {
      heading: "4. Who may receive information",
      paragraphs: [
        "We do not sell personal information. We may share the minimum relevant information with service providers that help operate the website and handle communications, subject to appropriate controls and applicable law."
      ],
      bullets: [
        "Website hosting and deployment providers, including Vercel, for delivering the site and related technical operations.",
        "Email delivery providers, including Resend where configured, so that enquiries can be received and answered.",
        "Anti-spam or security services, including Cloudflare Turnstile if enabled, to help distinguish genuine submissions from automated abuse.",
        "Payment or digital-delivery providers only if those functions are introduced and activated in the future. The current demo store does not take online payments.",
        "Professional advisers, regulators, courts or law-enforcement bodies when disclosure is lawful or necessary to protect rights, safety or comply with law."
      ]
    },
    {
      heading: "5. International transfers",
      paragraphs: [
        "Some website or communications providers may process information in countries outside the country where you live. Where data-protection law requires safeguards for an international transfer, we will use an appropriate mechanism, such as an adequacy decision or approved contractual protections, and take reasonable steps to protect the information."
      ]
    },
    {
      heading: "6. How long we keep information",
      paragraphs: [
        "We keep personal information only for as long as reasonably necessary for the purpose it was collected, including to respond to an enquiry, maintain appropriate business records, resolve disputes and meet legal requirements. Retention periods depend on the type of information and the context; we periodically review information and securely delete or anonymise it when it is no longer needed.",
        "For example, we may retain an ordinary enquiry and its correspondence for up to 24 months after the last meaningful contact where that is reasonably needed to manage the relationship. Records related to contracts, tax or accounting may need to be kept longer where the law requires it. These are working guidelines, not a promise that every record is removed on a fixed date."
      ]
    },
    {
      heading: "7. Security",
      paragraphs: [
        "We use reasonable technical and organisational measures intended to protect information against unauthorised access, loss, misuse or alteration. No internet transmission or storage system can be guaranteed completely secure. Please avoid sending payment-card details, passwords or highly sensitive information through ordinary email or a general enquiry form."
      ]
    },
    {
      heading: "8. Your privacy rights",
      paragraphs: [
        "Depending on your location and the applicable law, you may have rights to request access to personal information, correct it, delete it, restrict or object to certain processing, receive a portable copy, withdraw consent where processing relies on consent, or complain to a data-protection regulator. These rights are subject to legal conditions and exceptions.",
        "To exercise a right, email connect@theafricaplug.com and explain your request. We may need to verify your identity before acting. If UK data-protection law applies, you can also contact the Information Commissioner's Office (ICO) through its official website. You may contact your local regulator where another law applies."
      ]
    },
    {
      heading: "9. Children",
      paragraphs: [
        "This website and its business enquiries are intended for a general audience and are not designed to collect information from children. Please do not submit a child's personal information unless you are authorised to do so and it is genuinely necessary."
      ]
    },
    {
      heading: "10. External websites and changes",
      paragraphs: [
        "The website may link to services or websites operated by other organisations. Their privacy practices are controlled by them, so read their own policies before sharing information. We may update this policy as the website or applicable law changes. The effective date above indicates the version currently published."
      ]
    }
  ];

  return (
    <LegalPage
      eyebrow="YOUR INFORMATION"
      title="PRIVACY POLICY"
      intro="A clear explanation of the personal information that may be handled when you visit The Africa Plug, contact us or explore our services."
      notice="This policy is a working draft. The Store is not currently taking online payments. Optional analytics are sent only after a visitor accepts analytics in the privacy banner. Review this policy against the final data providers and business details before launch."
      sections={sections}
    />
  );
}

export function TermsOfUse() {
  const sections: LegalSection[] = [
    {
      heading: "1. About these terms",
      paragraphs: [
        "These terms govern your use of The Africa Plug website. By using the site, you agree to use it lawfully and in accordance with these terms. If you do not agree, please stop using the site.",
        "The Africa Plug provides information about African markets, business, investment, culture, travel, lifestyle and opportunities, alongside routes for enquiries and potential services. These website terms do not replace a separate written agreement for any consulting, advisory or other paid service."
      ]
    },
    {
      heading: "2. Information is not professional or investment advice",
      paragraphs: [
        "Website content is provided for general information and educational purposes. It is not legal, tax, financial, investment, immigration or other regulated professional advice, and it should not be the only basis for a commercial decision.",
        "Markets, rules, opportunities, costs and local circumstances can change and may differ by location. You should independently verify important facts and seek advice from appropriately qualified professionals before committing money, signing a contract or entering a market. We do not promise that an opportunity, investment, introduction or commercial result will be available, suitable or successful."
      ]
    },
    {
      heading: "3. Website access and acceptable use",
      paragraphs: [
        "We aim to keep the website available and information useful, but we do not guarantee uninterrupted access, that every page will always be error-free, or that all material will remain available indefinitely. We may change, suspend or withdraw features for operational, security or business reasons.",
        "You must not misuse the website, interfere with its operation, attempt unauthorised access, introduce malicious code, harvest personal information, send abusive or unlawful submissions, infringe another person's rights, or use the site in a way that violates applicable law."
      ]
    },
    {
      heading: "4. Intellectual property and permitted use",
      paragraphs: [
        "Unless otherwise indicated, website text, brand assets, designs, original graphics and other materials are owned by or licensed to The Africa Plug and are protected by intellectual-property laws. The Africa Plug name, logo and visual identity may not be copied or used to suggest endorsement without written permission.",
        "You may access and print reasonable portions for your personal or internal business reference, provided you do not remove notices or misrepresent the source. You must not republish, sell, systematically copy, modify or distribute website materials commercially without prior permission. Third-party names, marks and materials remain the property of their respective owners."
      ]
    },
    {
      heading: "5. Enquiries and business relationships",
      paragraphs: [
        "Submitting an enquiry does not create a client relationship, partnership, agency, fiduciary duty or commitment by either party. We may request further information, decline an enquiry or be unable to respond. Any agreed service, scope, fee, timetable, confidentiality obligation and cancellation rule should be set out separately in writing before work begins.",
        "Please ensure that information you submit is accurate to the best of your knowledge and that you have permission to share any third-party personal or confidential information included in your message."
      ]
    },
    {
      heading: "6. Store catalogue and product information",
      paragraphs: [
        "At the effective date of these terms, the bookshelf is a demonstration catalogue. The displayed product names, descriptions and prices are illustrative placeholders, and the Pay buttons open an email enquiry; they do not initiate a payment or create a completed order. Do not send card or bank details by email.",
        "If online sales are enabled later, each product page, checkout and order confirmation will set out the actual product, price, currency, delivery method, applicable taxes and any product-specific terms. A separate order is accepted only when the checkout and confirmation process says it is accepted."
      ]
    },
    {
      heading: "7. Third-party links and information",
      paragraphs: [
        "Links to third-party websites, providers, listings, organisations or resources are supplied for convenience or context. We do not control every external page and are not responsible for its content, security, availability or privacy practices. A link does not necessarily mean that we endorse the linked organisation or guarantee an opportunity."
      ]
    },
    {
      heading: "8. Responsibility and consumer rights",
      paragraphs: [
        "Nothing in these terms excludes or limits liability where the law does not allow it, including applicable mandatory consumer rights. Subject to that, the website and general information are supplied without a promise that they will meet every visitor's individual needs. To the extent permitted by law, we exclude implied warranties that may otherwise apply to the site's availability or suitability for a particular purpose.",
        "You remain responsible for evaluating information and making your own decisions. Any liability arising from a separately agreed paid service will be governed by that service's written agreement and applicable law."
      ]
    },
    {
      heading: "9. Privacy and cookies",
      paragraphs: [
        "Our Privacy Policy and Cookie Policy explain how information and relevant technologies are handled. Please read them alongside these terms."
      ]
    },
    {
      heading: "10. Changes and governing law",
      paragraphs: [
        "We may update these terms when the website, services or legal requirements change. The version published on this page applies from its stated effective date. These terms are intended to be governed by the law of England and Wales where legally appropriate, without removing any mandatory consumer protections that apply where you live. If a court finds one provision unenforceable, the remaining provisions continue to apply."
      ]
    }
  ];

  return (
    <LegalPage
      eyebrow="USING THIS WEBSITE"
      title="TERMS OF USE"
      intro="The ground rules for browsing The Africa Plug, reading its information and using the website's enquiry and store demonstration features."
      notice="These terms are an editable first draft based on the current website. The legal operator identity and any future paid-service or checkout terms should be confirmed before commercial launch."
      sections={sections}
    />
  );
}

export function CookiePolicy() {
  const sections: LegalSection[] = [
    {
      heading: "1. What cookies and similar technologies are",
      paragraphs: [
        "Cookies are small files saved by a browser. Similar technologies can store or read information on a device, recognise a browser, maintain a session or help a service understand technical activity. This policy uses “cookies” as a convenient term for cookies and similar tools."
      ]
    },
    {
      heading: "2. What the current website uses",
      paragraphs: [
        "The website requires technical services to deliver pages, protect them from abuse and keep the site operating. Hosting, security or form-protection providers may process technical information or use strictly necessary storage as part of those functions.",
        "In the front-end implementation reviewed on 14 October 2026, we did not identify an intentional advertising or analytics-cookie feature. Third-party fonts, images, embeds or services may still make requests to their providers and those providers may receive standard technical information. Actual cookies can also depend on deployment settings and services enabled outside the code, so this statement is not a guarantee that no technical cookies are present."
      ]
    },
    {
      heading: "3. Essential technologies",
      paragraphs: [
        "Where a cookie or similar technology is strictly necessary to provide a service you have requested, maintain security or support a function you actively use, it may be used without optional marketing consent where the applicable law permits that treatment. We will not describe a technology as essential merely because it is convenient to us."
      ]
    },
    {
      heading: "4. Analytics, advertising and other optional technologies",
      paragraphs: [
        "Analytics, personalisation and advertising technologies are not part of the intended current front-end implementation reviewed for this policy. If we add technologies that require consent, we intend to provide a clear consent choice before they are set or activated, explain their purposes, and make it possible to change or withdraw the choice. We should update this policy with the actual provider names, purposes, lifetimes and any international-transfer details before enabling them."
      ]
    },
    {
      heading: "5. Managing preferences",
      paragraphs: [
        "Your browser settings usually allow you to view, block or delete cookies. Blocking all cookies may affect features or how some pages work. Browser controls are not always a substitute for a consent mechanism where one is legally required.",
        "A privacy banner is provided on public pages so you can accept or reject optional analytics. Essential site functions remain available regardless of that choice. Your selection is stored in this browser and can be changed by clearing the site’s local storage. This banner is a basic preference control; this policy and the site’s technology inventory must still be reviewed before launch."
      ]
    },
    {
      heading: "6. Third-party services and changes",
      paragraphs: [
        "Some content or features may be delivered by providers outside our control. Their technologies are subject to their own terms and policies. We may revise this page when the website changes and will review it before introducing analytics, advertising, embedded media or other tracking features."
      ]
    }
  ];

  return (
    <LegalPage
      eyebrow="DEVICE PREFERENCES"
      title="COOKIE POLICY"
      intro="How cookies and similar technologies can support website operation, security and optional features."
      notice="This policy is written for the current implementation as reviewed on 14 October 2026. No active consent banner was verified, so non-essential tracking should not be introduced until the required consent controls are in place."
      sections={sections}
    />
  );
}

export function RefundPolicy() {
  const sections: LegalSection[] = [
    {
      heading: "1. Current store status",
      paragraphs: [
        "The Africa Plug Bookshelf is currently a demonstration catalogue. Product names, descriptions and prices are layout placeholders. The Pay buttons open an email enquiry to connect@theafricaplug.com; they do not process a transaction, request card details or place a paid order. No payment should be sent in response to a demo button."
      ]
    },
    {
      heading: "2. General approach to refunds",
      paragraphs: [
        "When paid products or services are made available, refund and cancellation rights will depend on the type of purchase, the contract, the circumstances and the consumer law that applies. Nothing in this policy is intended to remove or reduce a mandatory statutory right. Product-specific terms and the final checkout information must be reviewed and published before online sales start."
      ]
    },
    {
      heading: "3. Digital guides, downloads and workbooks",
      paragraphs: [
        "Where digital content is sold, we will provide the product description, format, delivery method, price and any relevant access requirements before you purchase. If a download is faulty, inaccessible or materially different from its description, contact us so we can investigate and provide a remedy required by applicable law, which may include correcting the problem or a refund.",
        "For online digital content, consumers may have a 14-day cancellation period under UK distance-selling rules, subject to the type of contract and applicable exceptions. Where the law permits an immediate digital supply to remove that cancellation right, we will obtain the required express consent and acknowledgement before supply. We will not treat a generic “no refunds” statement as overriding statutory rights."
      ]
    },
    {
      heading: "4. Consulting, bookings and deposits",
      paragraphs: [
        "The current site does not take consulting deposits or booking payments through the store. If a paid consulting engagement or booking is offered, the written proposal or booking terms will explain the service, fee, what any deposit covers, cancellation/rescheduling windows, no-show consequences and the method for requesting a refund before payment is made.",
        "We will not assume that every deposit is automatically non-refundable. The treatment of a deposit depends on the agreed terms, work already performed, expenses properly incurred and mandatory law. If the terms for a particular engagement are unclear, ask for clarification in writing before paying."
      ]
    },
    {
      heading: "5. Physical products, if introduced",
      paragraphs: [
        "If physical items are introduced, the order page will explain delivery costs, dispatch estimates and the applicable cancellation, return and refund process. Consumer cancellation rights and exceptions vary by product and law. Faulty, damaged or misdescribed products will be handled in accordance with the legal rights that apply."
      ]
    },
    {
      heading: "6. How to request help or a refund",
      paragraphs: [
        "Email connect@theafricaplug.com with your name, order reference (if one exists), product or service name, purchase date and a clear description of the issue. Please do not include full card numbers, security codes, passwords or other sensitive payment credentials. We may ask for reasonable information to identify the transaction or understand the issue.",
        "Where a refund is approved or legally due, it will normally be returned through the original payment method unless the law requires otherwise or another method is agreed. The processing time can depend on the payment provider and bank; any mandatory statutory deadline will apply."
      ]
    },
    {
      heading: "7. Policy updates and mandatory rights",
      paragraphs: [
        "We may update this policy before launching real checkout or new products. The version and any order-specific terms presented at purchase will be relevant to that purchase, subject always to mandatory law. This policy does not limit statutory rights that cannot legally be excluded."
      ]
    }
  ];

  return (
    <LegalPage
      eyebrow="ORDERS AND CANCELLATIONS"
      title="REFUNDS POLICY"
      intro="How cancellation and refund requests will be handled for guides, downloads, consulting services and any future store products."
      notice="The online bookshelf is currently a demo and does not take payments. This policy is an editable framework, not a statement that a live checkout, order system or booking-payment workflow is already active."
      sections={sections}
    />
  );
}
