import "server-only";

export type OpportunityStatus = "draft" | "live" | "closed" | "archived";

export type TapInOpportunity = {
  id: string;
  slug: string;
  title: string;
  country: string;
  region: string;
  sector: string;
  opportunity_type: string;
  description: string;
  who_this_is_for: string;
  enquiry_questions: string[];
  status: OpportunityStatus;
  image_url: string | null;
  share_image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

export type OpportunityInput = Omit<TapInOpportunity, "id" | "created_at" | "updated_at">;

function getConfig() {
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !serviceKey) {
    throw new Error("TAP_IN_DATABASE_NOT_CONFIGURED: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then run the TAP IN database migration.");
  }
  return { baseUrl, serviceKey };
}

async function requestDatabase<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { baseUrl, serviceKey } = getConfig();
  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = await response.text();
  if (!response.ok) {
    console.error("TAP IN database request failed:", response.status, body.slice(0, 500));
    throw new Error(response.status === 404
      ? "The TAP IN table is missing. Apply docs/supabase/migrations/202610160001_tap_in_opportunities.sql in Supabase."
      : `TAP IN database request failed (${response.status}). Check the database migration and Supabase configuration.`);
  }
  if (!body) return undefined as T;
  return JSON.parse(body) as T;
}

const TABLE = "tap_in_opportunities";

export async function listAllOpportunities() {
  return requestDatabase<TapInOpportunity[]>(
    `${TABLE}?select=*&order=updated_at.desc,title.asc`,
  );
}

export async function listLiveOpportunities() {
  return requestDatabase<TapInOpportunity[]>(
    `${TABLE}?select=*&status=eq.live&order=updated_at.desc,title.asc`,
  );
}

export async function findPublicOpportunityBySlug(slug: string) {
  const rows = await requestDatabase<TapInOpportunity[]>(
    `${TABLE}?select=*&slug=eq.${encodeURIComponent(slug)}&status=neq.draft&limit=1`,
  );
  return rows[0] ?? null;
}

export async function findOpportunityBySlug(slug: string) {
  const rows = await requestDatabase<TapInOpportunity[]>(
    `${TABLE}?select=id,slug&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  );
  return rows[0] ?? null;
}

export async function createOpportunity(input: OpportunityInput) {
  const rows = await requestDatabase<TapInOpportunity[]>(
    TABLE,
    {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(input),
    },
  );
  return rows[0];
}

export async function updateOpportunity(id: string, input: OpportunityInput) {
  const rows = await requestDatabase<TapInOpportunity[]>(
    `${TABLE}?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(input),
    },
  );
  if (!rows[0]) return null;
  return rows[0];
}
