import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";
import { getSupabaseServiceRoleKey } from "@/lib/supabase-service-role";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const BUCKET = "store-downloads";

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  if (!/^[a-f0-9]{64}$/.test(token)) return NextResponse.json({ error: "This private download link is invalid." }, { status: 404 });
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = supabaseUrl ? getSupabaseServiceRoleKey(supabaseUrl) : null;
  if (!supabaseUrl || !serviceKey) return NextResponse.json({ error: "Private downloads are temporarily unavailable." }, { status: 503 });

  try {
    const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const { data, error } = await db.rpc("consume_store_download_link", { p_token_hash: tokenHash });
    if (error) throw error;
    const access = Array.isArray(data) ? data[0] : null;
    if (!access) return NextResponse.json({ error: "This link has expired or reached its five-download limit." }, { status: 410, headers: { "Cache-Control": "no-store" } });

    const result = await cmsBridge<{ records?: CmsRecord[] }>({ action: "cms.list", module: "products", slug: access.product_slug, status: "all" });
    const product = result.records?.find((row) => row.slug === access.product_slug);
    const fileRef = product?.data?.productFileReference;
    if (!product || typeof fileRef !== "string" || !fileRef.startsWith(access.product_slug + "/")) {
      return NextResponse.json({ error: "The guide file is temporarily unavailable. Please contact The Africa Plug." }, { status: 404 });
    }
    const { data: signed, error: signedError } = await db.storage.from(BUCKET).createSignedUrl(fileRef, 90);
    if (signedError || !signed?.signedUrl) throw signedError ?? new Error("Signed download URL unavailable.");
    return NextResponse.redirect(signed.signedUrl, { status: 302, headers: { "Cache-Control": "no-store, max-age=0", "Referrer-Policy": "no-referrer" } });
  } catch (error) {
    console.error("Private Store download failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "We could not open this download. Please try again or contact The Africa Plug." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
