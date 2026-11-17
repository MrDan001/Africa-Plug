import { escapeHtml, fill, wrapHtml, type EmailVarValues } from "./layout";

/**
 * Client-facing email copy for The Africa Plug website.
 * Source of truth: FK's "The Africa Plug website: email copy" document (21 emails).
 * Subjects and bodies are used exactly as written. {{tokens}} are the [square bracket] fields in the document.
 * Internal emails to FK and the team are NOT defined here and stay as they are.
 */
export type EmailId =
  | "applicationReceived"
  | "applicationApproved"
  | "applicationDeclined"
  | "paymentLink"
  | "dealDiagnosticPaid"
  | "callPaid"
  | "petTravelPaid"
  | "preorderConfirmed"
  | "guideReady"
  | "waitlistAvailable"
  | "contactReceived"
  | "askReceived"
  | "partnerReceived"
  | "tapRegistered"
  | "tapOpportunitySubmitted"
  | "tapInterestExpressed"
  | "tapAlertsSignup"
  | "tapNewOpportunity"
  | "blogConfirm"
  | "blogSubscribed"
  | "blogNewArticle";

type Template = {
  /** 1-21 as numbered in the copy document. */
  number: number;
  subject: string;
  /** True when the email opens "Hello [First name],". Otherwise it opens "Hello,". */
  named: boolean;
  body: string[];
  /** Replies go to ask@ instead of connect@ (email 12 only). */
  replyTo?: "ask";
};

const SIGN_OFF = "The Africa Plug";

export const EMAIL_TEMPLATES: Record<EmailId, Template> = {
  // Work With FK: Deal Diagnostic
  applicationReceived: {
    number: 1,
    subject: "We've received your application",
    named: true,
    body: [
      "Thank you for applying to work with FK. Your brief is now with us.",
      "FK reviews every application personally. If it's a fit, you'll receive an approval email, followed by a secure payment link for the Deal Diagnostic. If it isn't, we'll let you know.",
      "This email confirms we've received your application. It is not an approval or a confirmation of an engagement.",
    ],
  },
  applicationApproved: {
    number: 2,
    subject: "Your application has been approved",
    named: true,
    body: [
      "FK has reviewed your brief and approved your application for a Deal Diagnostic.",
      "The Deal Diagnostic is a 90 minute session with FK. You leave with her read on the deal: what's controlling the outcome, where the risks sit and your next steps.",
      "The fee is £2,500. Your secure payment link follows in a separate email. Please only pay through that link.",
      "Once payment is confirmed, you'll choose your time with FK straight away.",
    ],
  },
  applicationDeclined: {
    number: 3,
    subject: "An update on your application",
    named: true,
    body: [
      "Thank you for applying to work with FK and for the time you put into your brief.",
      "After careful review, we're unable to take this application forward. This is usually a question of fit or timing rather than the merit of the deal itself.",
      "We wish you every success, and you're welcome to apply again if your plans change.",
    ],
  },
  paymentLink: {
    number: 4,
    subject: "Your Deal Diagnostic payment link",
    named: true,
    body: [
      "Here is your secure payment link for the Deal Diagnostic with FK",
      "{{paymentLink}}",
      "The link is valid for 24 hours. If it expires, reply to this email and we'll send you a new one.",
      "As soon as payment goes through, you'll be taken to FK's calendar to choose your time. You'll also receive an email with your booking link, in case you'd rather book later.",
      "Our Refunds Policy applies: {{refunds}}",
    ],
  },
  dealDiagnosticPaid: {
    number: 5,
    subject: "Payment confirmed: choose your time with FK",
    named: true,
    body: [
      "Thank you. Your payment for the Deal Diagnostic is confirmed.",
      "If you haven't chosen your time yet, book your 90 minutes with FK here:",
      "{{bookingLink}}",
      "This link is for you only, so please don't share it.",
      "You can reschedule once, free of charge, with at least 48 hours' notice. Full terms: {{refunds}}",
    ],
  },

  // 30 minute call with FK
  callPaid: {
    number: 6,
    subject: "Payment successful: book your 30-minute call with FK",
    named: true,
    body: [
      "Thank you. Your payment for the 30-minute call with FK has been received successfully.",
      "Choose your preferred date and time using the booking button below:",
      "{{callBookingLink}}",
      "If you leave this page, close your browser or lose your internet connection before booking, simply return to this email and use the booking button. You do not need to make another payment.",
      "This booking link is for you only, so please do not share it.",
      "You can reschedule once, free of charge, with at least 48 hours' notice. Missed sessions can't be refunded or rescheduled.",
    ],
  },

  // Pet Travel Consultation
  petTravelPaid: {
    number: 7,
    subject: "Payment confirmed: book your Pet Travel Consultation",
    named: true,
    body: [
      "Thank you. Your Pet Travel Consultation is confirmed.",
      "If you haven't chosen your time yet, book your 20 minutes here:",
      "{{bookingLink}}",
      "To make the most of the call, have these details ready: where your pet is travelling from and to, roughly when, and your pet's type and breed. That way we can map out the route, the paperwork and the timing together.",
      "You can reschedule once, free of charge, with at least 48 hours' notice.",
    ],
  },

  // Store
  preorderConfirmed: {
    number: 8,
    subject: "Your preorder is confirmed: {{guideTitle}}",
    named: true,
    body: [
      "Your preorder is confirmed. We'll email your private download link the moment the guide is released. Your receipt from Stripe will arrive separately.",
    ],
  },
  guideReady: {
    number: 9,
    subject: "{{guideTitle}} is ready",
    named: true,
    body: [
      "The wait is over. {{guideTitle}} is ready for you.",
      "Download it here: {{downloadLink}}",
      "Your link allows five downloads and works for 30 days, so save a copy somewhere safe.",
    ],
  },
  waitlistAvailable: {
    number: 10,
    subject: "{{guideTitle}} is now available",
    named: true,
    body: [
      "You asked us to let you know when {{guideTitle}} was available. It is.",
      "{{productLink}}",
      "If you'd rather not hear about it again, unsubscribe here: {{unsubscribeLink}}",
    ],
  },

  // Enquiry forms
  contactReceived: {
    number: 11,
    subject: "Thank you for contacting The Africa Plug",
    named: true,
    body: ["Thank you for getting in touch. Your message is with us, and we'll reply to you directly."],
  },
  askReceived: {
    number: 12,
    subject: "Your question is with us",
    named: true,
    replyTo: "ask",
    body: [
      "Thank you for asking The Africa Plug. Your question is now with our team.",
      "We may answer you directly, or it may shape what we research and publish next. Either way, every question is read.",
    ],
  },
  partnerReceived: {
    number: 13,
    subject: "Thank you for your partnership enquiry",
    named: true,
    body: [
      "Thank you for considering a partnership with The Africa Plug. We've received your details and will review the opportunity.",
      "If there's a fit, we'll be in touch to take it further.",
    ],
  },

  // T.A.P IN
  tapRegistered: {
    number: 14,
    subject: "You're registered with T.A.P IN",
    named: true,
    body: [
      "Thank you for registering your interest with T.A.P IN. Your details are with us.",
      "When an opportunity matches what you're looking for, we'll be in touch.",
    ],
  },
  tapOpportunitySubmitted: {
    number: 15,
    subject: "Your opportunity has been submitted to T.A.P IN",
    named: true,
    body: [
      "Thank you for submitting your opportunity to T.A.P IN. Our team will review it.",
      "If it's a fit for T.A.P IN, we'll contact you about the next steps.",
    ],
  },
  tapInterestExpressed: {
    number: 16,
    subject: "Your interest in {{opportunityName}}",
    named: true,
    body: [
      "Thank you for your interest in {{opportunityName}}. Your details are now with our team.",
      "If it's a match, we'll contact you to discuss the next steps.",
    ],
  },
  tapAlertsSignup: {
    number: 17,
    subject: "You're signed up for T.A.P IN alerts",
    named: false,
    body: [
      "You're signed up. We'll email you whenever a new opportunity goes live on T.A.P IN.",
      "Unsubscribe at any time: {{unsubscribeLink}}",
    ],
  },
  tapNewOpportunity: {
    number: 18,
    subject: "New on T.A.P IN: {{opportunityName}}",
    named: false,
    body: [
      "A new opportunity is live on T.A.P IN.",
      "{{opportunityName}}",
      "{{shortSummary}}",
      "View it here: {{opportunityLink}}",
      "Unsubscribe from T.A.P IN alerts: {{unsubscribeLink}}",
    ],
  },

  // The Blog
  blogConfirm: {
    number: 19,
    subject: "Confirm your subscription to The Blog",
    named: false,
    body: [
      "Please confirm your email address to receive new articles from The Blog by The Africa Plug:",
      "{{confirmLink}}",
      "This link expires in 48 hours. If you didn't sign up, you can ignore this email.",
    ],
  },
  blogSubscribed: {
    number: 20,
    subject: "You're subscribed to The Blog",
    named: false,
    body: [
      "You're in. We'll email you whenever a new article goes live.",
      "Unsubscribe at any time: {{unsubscribeLink}}",
    ],
  },
  blogNewArticle: {
    number: 21,
    subject: "New on The Blog: {{articleTitle}}",
    named: false,
    body: [
      "{{articleTitle}}",
      "{{shortSummary}}",
      "Read it here: {{articleLink}}",
      "Unsubscribe from The Blog: {{unsubscribeLink}}",
    ],
  },
};

export type RenderedEmail = { subject: string; text: string; html: string; replyTo: "connect" | "ask" };

/** First word of a full name, for "Hello [First name],". Returns "" when there is no usable name. */
export function firstNameOf(fullName: unknown) {
  if (typeof fullName !== "string") return "";
  return fullName.trim().split(/\s+/)[0] ?? "";
}

/** Render one client email exactly as written in the copy document. */
export function renderEmail(id: EmailId, vars: EmailVarValues & { firstName?: string } = {}): RenderedEmail {
  const template = EMAIL_TEMPLATES[id];
  const name = template.named ? firstNameOf(vars.firstName) : "";
  const greeting = name ? `Hello ${name},` : "Hello,";
  const subject = fill(template.subject, vars, "text").replace(/[\r\n]+/g, " ").slice(0, 200);

  const textLines = template.body.map((line) => fill(line, vars, "text"));
  const htmlLines = template.body.map((line) => fill(line, vars, "html"));
  const bold = new Set<number>();
  template.body.forEach((line, index) => {
    if (line === "{{opportunityName}}" || line === "{{articleTitle}}") bold.add(index + 1);
  });

  const text = [greeting, ...textLines.filter((line) => line !== ""), SIGN_OFF].join("\n\n");
  const html = wrapHtml([escapeHtml(greeting), ...htmlLines, escapeHtml(SIGN_OFF)], bold);
  return { subject, text, html, replyTo: template.replyTo === "ask" ? "ask" : "connect" };
}
