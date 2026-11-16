import { cmsBridge } from "@/lib/cms-bridge";
import { findPublicOpportunityBySlug } from "@/lib/tap-in/opportunities";
import { interestSchema } from "@/lib/tap-in/forms";
import { sendTeamEmail } from "@/lib/tap-in/email";
import { verifyTurnstile } from "@/lib/work-with-fk/turnstile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** Express Interest on one listing. Saved in the admin, emailed to connect@, and answered automatically. */
export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return json({ error: "This opportunity link is not valid." }, 400);

  const opportunity = await findPublicOpportunityBySlug(slug).catch(() => null);
  if (!opportunity) return json({ error: "This opportunity could not be found." }, 404);
  if (opportunity.status !== "live") return json({ error: "This opportunity is closed and is no longer taking interest." }, 410);

  let raw: unknown;
  try { raw = await request.json(); }
  catch { return json({ error: "Please check the form and try again." }, 400); }
  const parsed = interestSchema.safeParse(raw);
  if (!parsed.success) return json({ error: parsed.error.issues[0]?.message ?? "Please check the information you entered." }, 400);
  const input = parsed.data;

  // Honeypot: bots fill the hidden field. Pretend success and store nothing.
  if (input.website) return json({ ok: true });

  const verified = await verifyTurnstile(
    input.turnstileToken,
    request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  );
  if (!verified) return json({ error: "The security check could not be verified. Please refresh the page and try again." }, 400);

  const submittedAt = new Date().toISOString();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://africa-plug.vercel.app").replace(/\/+$/, "");
  const listingLink = `${siteUrl}/tap-in#${opportunity.slug}`;

  // 1. Save in the site admin first, so nothing is lost if an email is missed.
  try {
    await cmsBridge({
      action: "cms.save",
      module: "enquiries",
      record: {
        title: `T.A.P IN interest: ${opportunity.title} (${input.name})`.slice(0, 240),
        slug: null,
        status: "new",
        data: {
          kind: "interest",
          enquiryType: "T.A.P IN express interest",
          opportunityName: opportunity.title,
          opportunitySlug: opportunity.slug,
          opportunityId: opportunity.id,
          opportunityLink: listingLink,
          name: input.name,
          organisation: input.company || "",
          email: input.email,
          phone: input.phone || "",
          country: input.country,
          message: input.looking,
          timeframe: input.timeframe || "",
          consentPrivacyTermsDueDiligence: true,
          sourcePath: `/tap-in#${opportunity.slug}`,
          submittedAt,
        },
      },
    });
  } catch (error) {
    console.error("T.A.P IN interest could not be stored:", error instanceof Error ? error.message : "Unknown error");
    return json({ error: "We couldn’t save your interest right now. Please try again shortly." }, 503);
  }

  try {
    await cmsBridge({
      action: "cms.save",
      module: "analytics",
      record: {
        title: `interest_submitted · /tap-in#${opportunity.slug}`,
        slug: null,
        status: "recorded",
        data: { eventName: "interest_submitted", path: "/tap-in", label: opportunity.title, source: "tap-in", recordedAt: submittedAt, utm: {} },
      },
    });
  } catch (error) {
    console.error("T.A.P IN conversion could not be recorded:", error instanceof Error ? error.message : "Unknown error");
  }

  // 2. Email the team and send the automatic reply.
  await sendTeamEmail({
    subject: `T.A.P IN interest: ${opportunity.title}`,
    heading: "T.A.P IN express interest",
    replyTo: input.email,
    rows: [
      ["Opportunity", opportunity.title],
      ["Opportunity link", listingLink],
      ["Full name", input.name],
      ["Company or organisation", input.company || "Not provided"],
      ["Email", input.email],
      ["Phone or WhatsApp", input.phone || "Not provided"],
      ["Country based in", input.country],
      ["What are you looking for?", input.looking],
      ["Timeframe", input.timeframe || "Not provided"],
      ["Agreed to Privacy Policy, Terms and due diligence", "Yes"],
    ],
    autoReply: {
      to: input.email,
      subject: `Thank you for your interest in ${opportunity.title}`,
      text: `Thank you for your interest in ${opportunity.title}. The Africa Plug team will be in touch if it’s a fit.`,
    },
  });

  return json({ ok: true });
}