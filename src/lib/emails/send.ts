import "server-only";
import { Resend } from "resend";
import { renderEmail, type EmailId } from "./templates";
import type { EmailVarValues } from "./layout";

export type ClientEmailResult = { status: "sent" | "not-configured" | "failed"; id?: string; error?: string };

/**
 * Every client email comes from The Africa Plug at connect@theafricaplug.com.
 * Replies go to connect@, except replies to "Ask The Africa Plug" (email 12), which go to ask@.
 */
function senders() {
  return {
    from: process.env.EMAIL_FROM || "The Africa Plug <connect@theafricaplug.com>",
    connect: process.env.EMAIL_CONNECT || "connect@theafricaplug.com",
    ask: process.env.EMAIL_ASK || "ask@theafricaplug.com",
  };
}

/** Send one of the 21 client emails. Never throws: callers decide what to do with the status. */
export async function sendClientEmail(
  id: EmailId,
  to: string,
  vars: EmailVarValues & { firstName?: string } = {},
): Promise<ClientEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { status: "not-configured" };
  try {
    const email = renderEmail(id, vars);
    const { from, connect, ask } = senders();
    const result = await new Resend(apiKey).emails.send({
      from,
      to: [to],
      replyTo: email.replyTo === "ask" ? ask : connect,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
    if (result.error) {
      console.error(`Client email "${id}" was rejected:`, result.error.message);
      return { status: "failed", error: result.error.message };
    }
    return { status: "sent", id: result.data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Client email "${id}" could not be sent:`, message);
    return { status: "failed", error: message };
  }
}
