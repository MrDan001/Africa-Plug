import "server-only";

export type CmsModule = "articles" | "products" | "applications" | "enquiries" | "subscribers" | "analytics" | "media" | "commercial-settings" | "site-settings";
export type CmsRecord = {
  id: string;
  module: CmsModule;
  title: string;
  slug: string | null;
  status: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

function bridgeConfig() {
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const secret = process.env.CMS_BRIDGE_SECRET;
  if (!baseUrl || !anonKey || !secret) {
    throw new Error("CMS_NOT_CONFIGURED: The CMS database bridge is not fully configured in the deployment environment.");
  }
  return { baseUrl, anonKey, secret };
}

export async function cmsBridge<T = Record<string, unknown>>(payload: Record<string, unknown>): Promise<T> {
  const { baseUrl, anonKey, secret } = bridgeConfig();
  const response = await fetch(`${baseUrl}/functions/v1/ap-cms-bridge`, {
    method: "POST",
    cache: "no-store",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      "x-ap-bridge-secret": secret,
    },
    body: JSON.stringify(payload),
  });
  let body: Record<string, unknown>;
  try { body = await response.json() as Record<string, unknown>; }
  catch { throw new Error("The CMS database returned an unreadable response."); }
  if (!response.ok) {
    const message = typeof body.error === "string" ? body.error : "The CMS database operation failed.";
    throw new Error(message);
  }
  return body as T;
}

export async function getPublicCmsRecords(module: "articles" | "products"): Promise<CmsRecord[]> {
  try {
    const result = await cmsBridge<{ records?: CmsRecord[] }>({ action: "cms.publicList", module });
    return Array.isArray(result.records) ? result.records : [];
  } catch (error) {
    console.error("Could not load published CMS records:", error instanceof Error ? error.message : "Unknown error");
    return [];
  }
}

export async function getPublicCmsRecord(module: "articles" | "products", slug: string): Promise<CmsRecord | null> {
  if (!slug) return null;
  const records = await getPublicCmsRecords(module);
  return records.find((record) => record.slug === slug) ?? null;
}
