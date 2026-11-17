import { REFUNDS_URL } from "./links";

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[c] || "");
}

/** Variable keys that hold a URL. They are validated and rendered as links in the HTML version. */
export const LINK_KEYS = [
  "paymentLink",
  "bookingLink",
  "downloadLink",
  "productLink",
  "unsubscribeLink",
  "confirmLink",
  "opportunityLink",
  "articleLink",
] as const;

export type LinkKey = (typeof LINK_KEYS)[number];
export type TextKey = "guideTitle" | "opportunityName" | "articleTitle" | "shortSummary";
export type EmailVarKey = LinkKey | TextKey;
export type EmailVarValues = Partial<Record<EmailVarKey, string>>;

const linkStyle = "display:inline-block;background:#d51f6d;color:#ffffff;font-weight:700;text-decoration:none;padding:12px 18px;border-radius:6px;line-height:1.4;word-break:break-word";
const TOKEN = /(\{\{[a-zA-Z]+\}\})/g;
const PAYMENT_LINK_LABEL = "Complete your secure payment here";
const REFUNDS_LINK_LABEL = "View our Refunds Policy";

function isLinkKey(key: string): key is LinkKey {
  return (LINK_KEYS as readonly string[]).includes(key);
}

/** Fill {{tokens}} in a line of copy. Text mode is plain text; HTML mode escapes and turns links into styled CTA blocks. */
export function fill(line: string, vars: EmailVarValues, mode: "text" | "html") {
  return line
    .split(TOKEN)
    .map((part) => {
      const match = /^\{\{([a-zA-Z]+)\}\}$/.exec(part);
      if (!match) return mode === "html" ? escapeHtml(part) : part;
      const key = match[1];
      if (key === "refunds") {
        return mode === "html"
          ? `<a href="${REFUNDS_URL}" style="${linkStyle}">${REFUNDS_LINK_LABEL}</a>`
          : REFUNDS_LINK_LABEL;
      }
      const value = (vars as Record<string, string | undefined>)[key]?.trim() ?? "";
      if (!value) {
        if (key === "shortSummary") return "";
        throw new Error(`Email is missing a value for ${key}.`);
      }
      if (isLinkKey(key)) {
        if (!/^https?:\\/\\//i.test(value)) throw new Error(`Email value for ${key} must be an http(s) URL.`);
        if (key === "paymentLink") {
          return mode === "html"
            ? `<a href="${escapeHtml(value)}" style="${linkStyle}">${PAYMENT_LINK_LABEL}</a>`
            : `${PAYMENT_LINK_LABEL}: ${value}`;
        }
        return mode === "html" ? `<a href="${escapeHtml(value)}" style="${linkStyle}">${escapeHtml(value)}</a>` : value;
      }
      return mode === "html" ? escapeHtml(value) : value.replace(/[\\r\\n]+/g, " ");
    })
    .join("");
}

/** The brand wrapper used by every client email. The copy itself is never altered here. */
export function wrapHtml(paragraphs: string[], boldLines: Set<number> = new Set()) {
  const body = paragraphs
    .map((html, index) => {
      if (!html) return "";
      const weight = boldLines.has(index) ? "font-weight:700;color:#292a2c;" : "";
      return `<p style="color:#4d5057;font-size:15px;line-height:1.7;margin:0 0 16px;${weight}">${html}</p>`;
    })
    .join("");
  return `<div style="background:#f7f5f1;padding:24px;font-family:Arial,sans-serif"><div style="max-width:600px;margin:0 auto;border:1px solid #dedbd4;background:#fff;padding:28px"><p style="color:#d51f6d;font-size:11px;font-weight:700;letter-spacing:2px;margin:0 0 20px">THE AFRICA PLUG</p>${body}</div></div>`;
}
