// FILE PATH: src/app/(site)/work-with-fk/page.tsx
import type { Metadata } from "next";
import "@/components/work-with-fk/work-with-fk.css";

export const metadata: Metadata = {
  title: { absolute: "Africa Commercial Deal Consultant | Work With FK | The Africa Plug" },
  description:
    "Work with FK, Africa Commercial Deal Consultant, on market entry, regulatory approvals and pan African deals. Most engagements start with a 90 minute Deal Diagnostic.",
  alternates: { canonical: "/work-with-fk" },
};

const APPLY_HREF = "/work-with-fk/apply";
// The 30 minute call booking page (built in the next stage).
const CALL_HREF = "/work-with-fk/call";

const CLIENT_LINE =
  "Clients include Nestlé, Oracle, Bouygues Construction, LVMH, Coca Cola, Diageo, MTN, 9mobile, FirstBank Group, Tilt Energy, eTranzact, ilBagno and Technogym, alongside others she can’t name under NDA.";

type IconName = "document" | "handshake" | "chart";

const WHEN: { icon: IconName; title: string; copy: string }[] = [
  { icon: "document", title: "BEFORE YOU COMMIT", copy: "Market entry, partner selection and deal structure." },
  { icon: "handshake", title: "WHILE IT MOVES", copy: "Regulatory approvals, negotiations and counterparties." },
  { icon: "chart", title: "WHEN IT STALLS", copy: "Finding what’s controlling the outcome, and the way through." },
];

const STEPS = [
  { number: "01", title: "APPLY:", copy: "Send your brief." },
  { number: "02", title: "APPROVAL:", copy: "If it’s a fit, you receive fees, terms and a private link to book." },
  { number: "03", title: "DIAGNOSTIC:", copy: "90 minutes with FK." },
];

function Icon({ name }: { name: IconName }) {
  const common = {
    width: 48,
    height: 48,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "document") {
    return (
      <svg {...common}>
        <path d="M14.5 2.5H6.5a1.5 1.5 0 0 0-1.5 1.5v16a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5V7Z" />
        <path d="M14.5 2.5V6a1 1 0 0 0 1 1H19" />
        <path d="M8.5 11.5h7M8.5 14.5h7M8.5 17.5h4.5" />
      </svg>
    );
  }
  if (name === "handshake") {
    return (
      <svg {...common}>
        <path d="m11 17 2 2a1 1 0 1 0 3-3" />
        <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
        <path d="m21 3 1 11h-2" />
        <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
        <path d="M3 4h8" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="4" y="14" width="4" height="7" rx=".6" />
      <rect x="10" y="10" width="4" height="11" rx=".6" />
      <rect x="16" y="6" width="4" height="15" rx=".6" />
      <path d="M3.5 9.5 8 5.5l3.5 2.5L17.5 2.5" />
      <path d="M13.5 2.5h4v4" />
    </svg>
  );
}

export default function WorkWithFkPage() {
  return (
    <div className="wfk">
      {/* 1. Hero */}
      <section className="wfk-hero" aria-labelledby="wfk-h1">
        <div className="wfk-hero-inner">
          <p className="wfk-label">AFRICA COMMERCIAL DEAL CONSULTANCY</p>
          <h1 id="wfk-h1">WORK WITH FK.</h1>
          <p className="wfk-hero-line">For deals in Africa important enough to want a specialist in the room.</p>
          <a className="wfk-btn wfk-btn-primary" href={APPLY_HREF}>
            START YOUR APPLICATION <span aria-hidden="true">→</span>
          </a>
          <p className="wfk-clients">{CLIENT_LINE}</p>
        </div>
      </section>

      {/* 2. When to bring FK in */}
      <section className="wfk-when" aria-labelledby="wfk-when-h2">
        <div className="wfk-wrap">
          <p className="wfk-label">AT ANY STAGE OF THE DEAL</p>
          <h2 id="wfk-when-h2">WHEN TO BRING FK IN</h2>
          <div className="wfk-when-grid">
            {WHEN.map((item) => (
              <article className="wfk-when-card" key={item.title}>
                <span className="wfk-when-icon"><Icon name={item.icon} /></span>
                <h3>{item.title}</h3>
                <span className="wfk-rule" aria-hidden="true" />
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. The Deal Diagnostic */}
      <section className="wfk-diagnostic" aria-labelledby="wfk-diag-h2">
        <div className="wfk-wrap">
          <p className="wfk-label">THE DEAL DIAGNOSTIC</p>
          <h2 id="wfk-diag-h2">Where most engagements start.</h2>
          <p className="wfk-diag-body">
            A 90 minute session with FK, by video or in person. You leave with her read on the deal: what’s controlling the outcome, the risks and your next steps.
          </p>
          <ol className="wfk-steps">
            {STEPS.map((step, i) => (
              <li className="wfk-step-item" key={step.number}>
                <div className="wfk-step">
                  <span className="wfk-step-num">{step.number}</span>
                  <span className="wfk-step-text">
                    <strong>{step.title}</strong>
                    <span>{step.copy}</span>
                  </span>
                </div>
                {i < STEPS.length - 1 ? <span className="wfk-step-arrow" aria-hidden="true">→</span> : null}
              </li>
            ))}
          </ol>
          <a className="wfk-btn wfk-btn-primary" href={APPLY_HREF}>
            START YOUR APPLICATION <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      {/* 4. One question? (smaller and quieter) */}
      <section className="wfk-call" aria-labelledby="wfk-call-h2">
        <div className="wfk-call-img" aria-hidden="true" />
        <div className="wfk-wrap wfk-call-inner">
          <p className="wfk-label">ONE QUESTION?</p>
          <h2 id="wfk-call-h2">A 30 minute call with FK.</h2>
          <a className="wfk-btn wfk-btn-primary" href={CALL_HREF}>
            BOOK A CALL <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </div>
  );
}