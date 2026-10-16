import { updateOpportunity } from "@/lib/tap-in/opportunities";
import { parseOpportunityInput } from "@/lib/tap-in/validation";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated()) {
    return Response.json({ error: "Please sign in to the admin workspace." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return Response.json({ error: "This opportunity ID is not valid." }, { status: 400 });
  }

  let input;
  try {
    input = parseOpportunityInput(await request.json());
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Check the opportunity details and try again." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const opportunity = await updateOpportunity(id, input);
    if (!opportunity) {
      return Response.json({ error: "This opportunity could not be found. Refresh the list and try again." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }
    return Response.json({ opportunity }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The TAP IN database is unavailable.";
    return Response.json({ error: message }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
