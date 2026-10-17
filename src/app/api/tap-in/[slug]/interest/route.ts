import { Resend } from "resend";
import { z } from "zod";
import { cmsBridge } from "@/lib/cms-bridge";
import { findPublicOpportunityBySlug } from "@/lib/tap-in/opportunities";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const answerSchema = z.object({
  question: z.string().trim().min(1).max(500),
  answer: z.string().trim().min(2).max(2000),
});
const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  organisation: z.string().trim().max(160).optional().default(""),
  phone: z.string().trim().max(50).optional().default(""),
  country: z.string().trim().max(200).optional().default(""),
  role: z.string().trim().max(120).optional().default(""),
  whatYouCanOffer: z.string().trim().min(10).max(3000),
  website: z.string().max(300).optional().default(""),
  turnstileToken: z.string().max(5000).optional().default(""),
  answers: z.array(answerSchema).min(2).max(4),
  sourcePath: z.string().max(300).optional().default(""),
  referrer: z.string().max(500).optional().default(""),
  utm: z.record(z.string(), z.string().max(300)).optional().default({}),
});

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function verifyTurnstile(token: string, ip: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    const result = await response.json() as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}

function safeUtm(input: Record<string, string>) {
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  return Object.fromEntries(keys.map((key) => [key, (input[key] || "").slice(0, 300)]));
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return json({ error: "This opportunity URL is not valid." }, 400);

  const opportunity = await findPublicOpportunityBySlug(slug).catch(() => null);
  if (!opportunity) return json({ error: "This opportunity could not be found." }, 404);
  if (opportunity.status !== "live") return json({ error: "This opportunity is no longer accepting expressions of interest. Please explore current opportunities." }, 410);

  let raw: unknown;
  try { raw = await request.json(); }
  catch { return json({ error: "Please check the form and try again." }, 400); }
  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) return json({ error: parsed.error.issues[0]?.message || "Please check the information you entered." }, 400);
  const input = parsed.data;
  if (input.website) {
    return json({ ok: true, message: `Thanks, The Africa Plug has received your expression of interest in ${opportunity.title}.` });
  }

  const questions = opportunity.enquiry_questions || [];
  if (input.answers.length !== questions.length) return json({ error: "The questions for this listing have changed. Refresh the page and try again." }, 400);
  const answers = questions.map((question, index) => ({
    question,
    answer: input.answers[index]?.answer?.trim() || "",
  }));
  if (answers.some((answer) => answer.answer.length < 2)) return json({ error: "Please answer every question for this opportunity." }, 400);

  const verified = await verifyTurnstile(
    input.turnstileToken,
    request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  );
  if (!verified) return json({ error: "The security check could not be verified. Refresh the page and try again." }, 400);

  const utm = safeUtm(input.utm);
  const submittedAt = new Date().toISOString();
  const leadData = {
    kind: "interest",
    enquiryType: "TAP IN expression of interest",
    name: input.name,
    email: input.email,
    organisation: input.organisation,
    phone: input.phone,
    country: input.country,
    role: input.role,
    opportunityName: opportunity.title,
    opportunitySlug: opportunity.slug,
    opportunityId: opportunity.id,
    whatYouCanOffer: input.whatYouCanOffer,
    answers,
    message: input.whatYouCanOffer,
    sourcePath: input.sourcePath || `/tap-in/${opportunity.slug}`,
    referrer: input.referrer,
    utm,
    submittedAt,
  };

  try {
    await cmsBridge({
      action: "cms.save",
      module: "enquiries",
      record: {
        title: `TAP IN expression of interest — ${input.name}`.slice(0, 240),
        slug: null,
        status: "new",
        data: leadData,
      },
    });
  } catch (error) {
    console.error("TAP IN expression of interest could not be stored:", error instanceof Error ? error.message : "Unknown error");
    return json({ error: "We couldn't save your expression of interest right now. Please try again shortly." }, 503);
  }

  try {
    await cmsBridge({
      action: "cms.save",
      module: "analytics",
      record: {
        title: `interest_submitted · /tap-in/${opportunity.slug}`,
        slug: null,
        status: "recorded",
        data: {
          eventName: "interest_submitted",
          path: `/tap-in/${opportunity.slug}`,
          label: opportunity.title,
          source: utm.utm_source || input.referrer || "direct",
          referrer: input.referrer,
          utm,
          recordedAt: submittedAt,
        },
      },
    });
  } catch (error) {
    console.error("TAP IN conversion event could not be recorded:", error instanceof Error ? error.message : "Unknown error");
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (apiKey && from) {
    try {
      const rows = [
        ["Opportunity", opportunity.title],
        ["Name", input.name],
        ["Email", input.email],
        ["Organisation", input.organisation || "Not provided"],
        ["Phone", input.phone || "Not provided"],
        ["Country / location", input.country || "Not provided"],
        ["Role", input.role || "Not provided"],
        ["What they can contribute / need", input.whatYouCanOffer],
        ...answers.map((answer, index) => [`Question ${index + 1}: ${answer.question}`, answer.answer]),
        ["Source path", leadData.sourcePath],
        ["UTM", JSON.stringify(utm)],
      ] as const;
      await new Resend(apiKey).emails.send({
        from,
        to: [process.env.EMAIL_CONNECT || "connect@theafricaplug.com"],
        replyTo: input.email,
        subject: `[TAP IN interest] ${opportunity.title} — ${input.name}`,
        text: rows.map(([label, value]) => `${label}:\n${value}`).join("\n\n"),
      });
    } catch (error) {
      console.error("TAP IN interest notification email failed; submission remains stored:", error instanceof Error ? error.message : "Unknown error");
    }
  }

  return json({
    ok: true,
    message: `Thanks, The Africa Plug has received your expression of interest in ${opportunity.title}.`,
  }, 201);
}
