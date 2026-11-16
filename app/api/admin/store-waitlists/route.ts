import { isAdminAuthenticated } from "@/lib/admin-auth";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isWaitlist(record: CmsRecord) {
  return record.module === "enquiries" && record.data?.enquiryType === "Store waitlist";
}

async function findWaitlistRecord(id: string) {
  const result = await cmsBridge<{ records?: CmsRecord[] }>({
    action: "cms.list",
    module: "enquiries",
    status: "all",
    id,
  });
  return (result.records ?? []).find((record) => record.id === id && isWaitlist(record)) ?? null;
}

export async function GET() {
  if (!await isAdminAuthenticated()) {
    return Response.json({ error: "Please sign in to the admin workspace." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const [leadResult, productResult] = await Promise.all([
      cmsBridge<{ records?: CmsRecord[] }>({ action: "cms.list", module: "enquiries", status: "all" }),
      cmsBridge<{ records?: CmsRecord[] }>({ action: "cms.list", module: "products", status: "all" }),
    ]);
    const products = (productResult.records ?? []).filter((item) => item.title && item.slug);
    const records = (leadResult.records ?? []).filter(isWaitlist).map((record) => {
      const data = record.data ?? {};
      const matched = products.find((product) => product.id === data.storeProductId)
        ?? products.find((product) => product.slug === data.storeProductSlug)
        ?? products.find((product) => product.title.trim().toLowerCase() === String(data.opportunityName ?? "").trim().toLowerCase());
      return {
        ...record,
        data: {
          ...data,
          resolvedProductId: matched?.id ?? String(data.storeProductId ?? ""),
          resolvedProductTitle: matched?.title ?? String(data.opportunityName ?? "Unlinked product"),
          resolvedProductSlug: matched?.slug ?? String(data.storeProductSlug ?? ""),
          resolvedProductAvailability: matched?.data?.availability ?? "",
        },
      };
    });
    return Response.json({ records, products }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Store waitlists could not be loaded:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "Could not load Store waitlists right now." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export async function PATCH(request: Request) {
  if (!await isAdminAuthenticated()) {
    return Response.json({ error: "Please sign in to the admin workspace." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  let input: { id?: string; action?: string };
  try { input = await request.json() as typeof input; }
  catch { return Response.json({ error: "Please submit valid waitlist changes." }, { status: 400 }); }
  if (!input.id || !["contacted", "waiting"].includes(input.action ?? "")) {
    return Response.json({ error: "A waitlist record and valid action are required." }, { status: 400 });
  }
  try {
    const record = await findWaitlistRecord(input.id);
    if (!record) return Response.json({ error: "That Store waitlist record could not be found." }, { status: 404 });
    const now = new Date().toISOString();
    const nextData = {
      ...record.data,
      waitlistStatus: input.action,
      ...(input.action === "contacted" ? { waitlistContactedAt: now } : { waitlistContactedAt: "" }),
    };
    const saved = await cmsBridge({
      action: "cms.save",
      module: "enquiries",
      record: { id: record.id, title: record.title, slug: record.slug, status: record.status, data: nextData },
    });
    return Response.json({ ok: true, record: (saved as { record?: CmsRecord }).record ?? null }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Store waitlist record could not be updated:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "Could not update that waitlist record." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export async function DELETE(request: Request) {
  if (!await isAdminAuthenticated()) {
    return Response.json({ error: "Please sign in to the admin workspace." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  let input: { id?: string };
  try { input = await request.json() as typeof input; }
  catch { return Response.json({ error: "Record ID is required." }, { status: 400 }); }
  if (!input.id) return Response.json({ error: "Record ID is required." }, { status: 400 });
  try {
    const record = await findWaitlistRecord(input.id);
    if (!record) return Response.json({ error: "That Store waitlist record could not be found." }, { status: 404 });
    await cmsBridge({ action: "cms.delete", module: "enquiries", id: record.id });
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Store waitlist record could not be removed:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "Could not remove that waitlist record." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
