import { put } from "@vercel/blob";
import { cmsBridge } from "@/lib/cms-bridge";
import { IMAGE_MAX_BYTES, IMAGE_TYPES, opportunitySchema, registerSchema } from "@/lib/tap-in/forms";
import { sendTeamEmail } from "@/lib/tap-in/email";
import { verifyTurnstile } from "@/lib/work-with-fk/turnstile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** "Register your interest" and "Submit an opportunity". Both arrive as multipart form data. */
export async function POST(request: Request) {
  let form: FormData;
  try { form = await request.formData(); }
  catch { return json({ error: "Please check the form and try again." }, 400); }

  const kind = form.get("kind");
  if (kind !== "register" && kind !== "opportunity") return json({ error: "Please check the form and try again." }, 400);

  const raw: Record<string, unknown> = {};
  for (const [key, value] of form.entries()) if (typeof value === "string") raw[key] = value;
  raw.consent = raw.consent === "true" || raw.consent === "on";

  const parsed = kind === "register" ? registerSchema.safeParse(raw) : opportunitySchema.safeParse(raw);
  if (!parsed.success) return json({ error: parsed.error.issues[0]?.message ?? "Please check the information you entered." }, 400);
  const input = parsed.data;

  // Honeypot: bots fill the hidden field. Pretend success and store nothing.
  if (input.website) return json({ ok: true });

  const verified = await verifyTurnstile(
    input.turnstileToken,
    request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  );
  if (!verified) return json({ error: "The security check could not be verified. Please refresh the page and try again." }, 400);

  // Optional image (opportunity only). Checked before anything is stored.
  let imageUrl = "";
  let imageNote = "";
  const file = kind === "opportunity" ? form.get("image") : null;
  if (file instanceof File && file.size > 0) {
    if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) return json({ error: "Please upload a JPG, PNG or WebP image." }, 415);
    if (file.size > IMAGE_MAX_BYTES) return json({ error: "The image must be smaller than 5 MB." }, 413);
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const safeName = file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(-80) || "image";
        const blob = await put(`tap-in-submissions/${Date.now()}-${safeName}`, file, { access: "public", addRandomSuffix: true, contentType: file.type });
        imageUrl = blob.url;
      } catch (error) {
        console.error("T.A.P IN submission image upload failed:", error instanceof Error ? error.message : "Unknown error");
        imageNote = "Image upload failed; ask the sender to email it.";
      }
    } else {
      imageNote = "Image storage is not connected; ask the sender to email it.";
    }
  }

  const submittedAt = new Date().toISOString();
  const isRegister = kind === "register";
  const data = isRegister
    ? (() => {
        const v = input as ReturnType<typeof registerSchema.parse>;
        return { kind: "register", enquiryType: "T.A.P IN register interest", name: v.name, organisation: v.company || "", email: v.email, message: v.looking, countryOfInterest: v.country };
      })()
    : (() => {
        const v = input as ReturnType<typeof opportunitySchema.parse>;
        return { kind: "opportunity", enquiryType: "T.A.P IN opportunity submission", name: v.name, organisation: v.company || "", email: v.email, message: v.offer, whatsOnOffer: v.offer, location: v.location, partnerSought: v.partner, imageUrl, imageNote };
      })();

  // 1. Save in the site admin first, so nothing is lost if an email is missed.
  try {
    await cmsBridge({
      action: "cms.save",
      module: "enquiries",
      record: {
        title: `${isRegister ? "T.A.P IN register interest" : "T.A.P IN opportunity submission"} (${input.name})`.slice(0, 240),
        slug: null,
        status: "new",
        data: { ...data, consentPrivacyTerms: true, sourcePath: "/tap-in", submittedAt },
      },
    });
  } catch (error) {
    console.error("T.A.P IN enquiry could not be stored:", error instanceof Error ? error.message : "Unknown error");
    return json({ error: "We couldn’t save your submission right now. Please try again shortly." }, 503);
  }

  // 2. Email the team.
  const rows: [string, string][] = isRegister
    ? (() => {
        const v = input as ReturnType<typeof registerSchema.parse>;
        return [["Name", v.name], ["Company or organisation", v.company || "Not provided"], ["Email", v.email], ["What you're looking for", v.looking], ["Country of interest", v.country]] as [string, string][];
      })()
    : (() => {
        const v = input as ReturnType<typeof opportunitySchema.parse>;
        return [["Name", v.name], ["Company or organisation", v.company || "Not provided"], ["Email", v.email], ["What's on offer", v.offer], ["Location", v.location], ["Type of commercial partner sought", v.partner], ["Image", imageUrl || imageNote || "None"]] as [string, string][];
      })();
  await sendTeamEmail({
    subject: isRegister ? `T.A.P IN register interest: ${input.name}` : `T.A.P IN opportunity submitted: ${input.name}`,
    heading: isRegister ? "T.A.P IN register interest" : "T.A.P IN opportunity submission",
    replyTo: input.email,
    rows: [...rows, ["Agreed to Privacy Policy and Terms", "Yes"]],
    autoReply: {
      to: input.email,
      subject: isRegister ? "Thank you for registering your interest in T.A.P IN" : "Thank you for submitting an opportunity to T.A.P IN",
      text: isRegister
        ? "Thank you for registering your interest in T.A.P IN. We have received your details and will be in touch if a relevant opportunity or next step arises."
        : "Thank you for sharing an opportunity with T.A.P IN. The Africa Plug team has received your submission and will review the details. We will be in touch if we need anything further or if it is suitable to progress.",
    },
  });

  return json({ ok: true });
}