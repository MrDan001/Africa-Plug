import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseServiceRoleKey } from "@/lib/supabase-service-role";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Please sign in to the admin workspace." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = url ? getSupabaseServiceRoleKey(url) : null;
  if (!url || !serviceRoleKey) {
    console.error("Store order management has no valid service-role credential for the configured Supabase project.");
    return NextResponse.json({ error: "Store order management is not configured for this Supabase project." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const status = new URL(request.url).searchParams.get("status") || "all";
  if (status !== "all" && !["paid", "refunded", "partially_refunded", "disputed", "processing"].includes(status)) {
    return NextResponse.json({ error: "Invalid order status filter." }, { status: 400 });
  }

  try {
    const database = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    let query = database.from("store_orders").select("*").order("created_at", { ascending: false }).limit(200);
    if (status !== "all") query = query.eq("status", status);
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ orders: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Store orders could not be loaded:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Could not load Store orders right now." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
