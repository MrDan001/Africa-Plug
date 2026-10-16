import { isAdminAuthenticated } from "@/lib/admin-auth";
import { cmsBridge, type CmsModule, type CmsRecord } from "@/lib/cms-bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const routeModules: Record<string, CmsModule> = {
  blog: "articles",
  store: "products",
  "work-with-fk": "applications",
  "review-required": "applications",
  enquiries: "enquiries",
  subscribers: "subscribers",
  analytics: "analytics",
  media: "media",
  settings: "commercial-settings",
  "site-settings": "site-settings",
};

async function resolveModule(context: { params: Promise<{ module: string }> }) {
  const { module } = await context.params;
  return { routeKey: module, module: routeModules[module] };
}

function unauthorised() {
  return Response.json({ error: "Please sign in to the admin workspace." }, { status: 401, headers: { "Cache-Control": "no-store" } });
}

function serverError(error: unknown) {
  const message = error instanceof Error ? error.message : "The CMS is temporarily unavailable.";
  return Response.json({ error: message }, { status: 503, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request, context: { params: Promise<{ module: string }> }) {
  if (!await isAdminAuthenticated()) return unauthorised();
  const { routeKey, module } = await resolveModule(context);
  if (!module) return Response.json({ error: "This admin module does not exist." }, { status: 404 });
  const { searchParams } = new URL(request.url);
  try {
    const result = await cmsBridge<{ records?: CmsRecord[] }>({
      action: "cms.list",
      module,
      status: searchParams.get("status") || "all",
      search: searchParams.get("search") || "",
      ...(searchParams.get("id") ? { id: searchParams.get("id")! } : {}),
    });
    let records = result.records ?? [];
    if (routeKey === "review-required") {
      const reviewStatuses = new Set(["review-required", "pending", "submitted", "new"]);
      records = records.filter((record) => reviewStatuses.has(record.status));
    }
    return Response.json({ records }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ module: string }> }) {
  if (!await isAdminAuthenticated()) return unauthorised();
  const { module } = await resolveModule(context);
  if (!module) return Response.json({ error: "This admin module does not exist." }, { status: 404 });
  let input: { record?: Record<string, unknown> };
  try { input = await request.json() as { record?: Record<string, unknown> }; }
  catch { return Response.json({ error: "Please submit a valid record." }, { status: 400 }); }
  if (!input.record || typeof input.record !== "object" || Array.isArray(input.record)) {
    return Response.json({ error: "Record details are required." }, { status: 400 });
  }
  try {
    const result = await cmsBridge<{ record: CmsRecord }>({ action: "cms.save", module, record: input.record });
    return Response.json({ record: result.record }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ module: string }> }) {
  if (!await isAdminAuthenticated()) return unauthorised();
  const { module } = await resolveModule(context);
  if (!module) return Response.json({ error: "This admin module does not exist." }, { status: 404 });
  let input: { id?: string; status?: string; record?: Record<string, unknown> };
  try { input = await request.json() as typeof input; }
  catch { return Response.json({ error: "Please submit valid changes." }, { status: 400 }); }
  try {
    if (input.record) {
      const result = await cmsBridge<{ record: CmsRecord }>({
        action: "cms.save",
        module,
        record: { ...input.record, ...(input.id ? { id: input.id } : {}) },
      });
      return Response.json({ record: result.record }, { headers: { "Cache-Control": "no-store" } });
    }
    if (!input.id || !input.status) return Response.json({ error: "Record ID and new status are required." }, { status: 400 });
    const result = await cmsBridge<{ record: CmsRecord }>({ action: "cms.status", module, id: input.id, status: input.status });
    return Response.json({ record: result.record }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ module: string }> }) {
  if (!await isAdminAuthenticated()) return unauthorised();
  const { module } = await resolveModule(context);
  if (!module) return Response.json({ error: "This admin module does not exist." }, { status: 404 });
  let input: { id?: string };
  try { input = await request.json() as { id?: string }; }
  catch { return Response.json({ error: "Record ID is required." }, { status: 400 }); }
  if (!input.id) return Response.json({ error: "Record ID is required." }, { status: 400 });
  try {
    await cmsBridge({ action: "cms.delete", module, id: input.id });
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return serverError(error);
  }
}
