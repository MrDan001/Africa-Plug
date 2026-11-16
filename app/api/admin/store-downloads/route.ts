import { createClient } from "@supabase/supabase-js";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseServiceRoleKey } from "@/lib/supabase-service-role";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!await isAdminAuthenticated()) return Response.json({ error: "Please sign in to the admin workspace." }, { status: 401 });
  const slug = new URL(request.url).searchParams.get("slug") || "";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return Response.json({ error: "Choose a valid guide." }, { status: 400 });
  const url = process.env.SUPABASE_URL;
  const key = url ? getSupabaseServiceRoleKey(url) : null;
  if (!url || !key) return Response.json({ error: "Store database is not configured." }, { status: 503 });
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await db.from("store_download_links")
    .select("customer_email,download_count,first_opened_at,last_downloaded_at,expires_at,email_sent_at")
    .eq("product_slug", slug)
    .order("created_at", { ascending: false });
  if (error) return Response.json({ error: "Could not load download activity." }, { status: 503 });
  return Response.json({ records: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
}
