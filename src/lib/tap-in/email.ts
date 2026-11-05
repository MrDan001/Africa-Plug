// FILE PATH: src/lib/tap-in/email.ts
import "server-only";
import { Resend } from "resend";

export function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

/**
 * Emails the team (connect@) and, if given, sends the person an automatic reply.
 * Never throws: the submission is already saved, so a failed email must not lose it.
 */
export async function sendTeamEmail(options: {
  subject: string;
  heading: string;
  rows: [string, string][];
  replyTo?: string;
  autoReply?: { to: string; subject: string; text: string };
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return "not-configured" as const;
  const to = process.env.EMAIL_CONNECT || "connect@theafricaplug.com";
  const resend = new Resend(apiKey);
  const subject = options.subject.replace(/[\r\n]+/g, " ").slice(0, 200);
  const text = options.rows.map(([key, value]) => `${key}:\n${value}`).join("\n\n");
  const tableRows = options.rows.map(([key, value]) =>
    `<tr><th align="left" style="padding:10px 12px;color:#626469;border-bottom:1px solid #dedbd4;font:600 12px Arial;vertical-align:top">${escapeHtml(key)}</th><td style="padding:10px 12px;color:#292a2c;border-bottom:1px solid #dedbd4;font:14px/1.6 Arial;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
  ).join("");
  try {
    const result = await resend.emails.send({
      from,
      to: [to],
      replyTo: options.replyTo,
      subject,
      text,
      html: `<div style="background:#f7f5f1;padding:24px;font-family:Arial,sans-serif"><div style="max-width:680px;margin:0 auto;border:1px solid #dedbd4;background:#fff;padding:22px"><p style="color:#d51f6d;font-size:11px;font-weight:700;letter-spacing:2px">THE AFRICA PLUG</p><h1 style="font-size:22px;color:#292a2c;margin:0 0 20px">${escapeHtml(options.heading)}</h1><table role="presentation" style="border-collapse:collapse;width:100%">${tableRows}</table></div></div>`,
    });
    if (result.error) console.error("Resend rejected a T.A.P IN email:", result.error.message);
  } catch (error) {
    console.error("T.A.P IN email could not be sent:", error instanceof Error ? error.message : "Unknown error");
  }
  if (options.autoReply) {
    try {
      const result = await resend.emails.send({
        from,
        to: [options.autoReply.to],
        replyTo: to,
        subject: options.autoReply.subject,
        text: options.autoReply.text,
        html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#292a2c"><p style="white-space:pre-wrap">${escapeHtml(options.autoReply.text)}</p></div>`,
      });
      if (result.error) console.error("Resend rejected a T.A.P IN auto reply:", result.error.message);
    } catch (error) {
      console.error("T.A.P IN auto reply could not be sent:", error instanceof Error ? error.message : "Unknown error");
    }
  }
  return "sent" as const;
}