import {
  createOpportunity,
  findOpportunityBySlug,
  listAllOpportunities,
} from "@/lib/tap-in/opportunities";
import { parseOpportunityInput, slugify } from "@/lib/tap-in/validation";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorised() {
  return Response.json({ error: "Please sign in to the admin workspace." }, { status: 401, headers: { "Cache-Control": "no-store" } });
}

function dbErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "The TAP IN database is unavailable.";
}

export async function GET() {
  if (!await isAdminAuthenticated()) return unauthorised();
  try {
    const opportunities = await listAllOpportunities();
    return Response.json({ opportunities }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: dbErrorMessage(error) }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) return unauthorised();
  let input;
  try {
    input = parseOpportunityInput(await request.json());
  } catch (error) {
    return Response.json({ error: dbErrorMessage(error) }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const baseSlug = slugify(input.slug || input.title);
    let candidate = baseSlug;
    let suffix = 2;
    while (await findOpportunityBySlug(candidate)) {
      candidate = `${baseSlug.slice(0, Math.max(1, 90 - String(suffix).length))}-${suffix}`;
      suffix += 1;
      if (suffix > 1000) throw new Error("Could not create a unique URL slug. Please choose a different title.");
    }
    const opportunity = await createOpportunity({ ...input, slug: candidate });
    return Response.json({ opportunity }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: dbErrorMessage(error) }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
