import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";
import { getSupabaseServiceRoleKey } from "@/lib/supabase-service-role";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "store-downloads";
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const TYPES: Record<string, string> = {
  pdf: "application/pdf",
  epub: "application/epub+zip",
  zip: "application/zip",
};

function response(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) return response("Please sign in to the admin workspace.", 401);

  let form: FormData;
  try { form = await request.formData(); }
  catch { return response("Please choose a valid file to upload.", 400); }

  const slug = typeof form.get("slug") === "string" ? String(form.get("slug")).trim() : "";
  const upload = form.get("file");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return response("Save the product with a valid URL slug before uploading its file.", 400);
  if (!(upload instanceof File)) return response("Choose a product file first.", 400);
  if (upload.size < 1 || upload.size > MAX_FILE_SIZE) return response("Protected product files must be smaller than 50 MB.", 400);

  const extension = upload.name.split(".").pop()?.toLowerCase() ?? "";
  const contentType = TYPES[extension];
  if (!contentType || !/\.(pdf|epub|zip)$/i.test(upload.name)) {
    return response("Use a PDF, EPUB or ZIP file for protected Store delivery.", 400);
  }
  if (upload.type && upload.type !== contentType && upload.type !== "application/octet-stream") {
    return response("The selected file type does not match its filename.", 400);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = supabaseUrl ? getSupabaseServiceRoleKey(supabaseUrl) : null;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Private file storage has no valid service-role credential for the configured Supabase project.");
    return response("Private file storage is not configured for this Supabase project. Please check the server-side service-role credential.", 503);
  }

  try {
    const result = await cmsBridge<{ records?: CmsRecord[] }>({
      action: "cms.list",
      module: "products",
      slug,
      status: "all",
    });
    const product = result.records?.find((record) => record.slug === slug);
    if (!product) return response("Create and save this Store product before uploading its file.", 404);

    const storage = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const safeName = upload.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(-100) || `download.${extension}`;
    const objectPath = `${slug}/${randomUUID()}-${safeName}`;
    const bytes = new Uint8Array(await upload.arrayBuffer());
    const { error: uploadError } = await storage.storage.from(BUCKET).upload(objectPath, bytes, {
      contentType,
      cacheControl: "3600",
      upsert: false,
    });
    if (uploadError) {
      console.error("Private Store file upload failed:", uploadError.message);
      return response("The protected file could not be uploaded. Please check storage setup and try again.", 502);
    }

    try {
      await cmsBridge({
        action: "cms.save",
        module: "products",
        record: {
          id: product.id,
          title: product.title,
          slug: product.slug,
          status: product.status,
          data: {
            ...product.data,
            productFileReference: objectPath,
            productFileName: upload.name.slice(0, 180),
            productFileUploadedAt: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      await storage.storage.from(BUCKET).remove([objectPath]).catch(() => ({ data: [], error: null }));
      throw error;
    }

    return NextResponse.json({
      ok: true,
      path: objectPath,
      message: "Protected file uploaded and linked to the Store product.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Store product file could not be saved:", error instanceof Error ? error.message : "Unknown error");
    return response("The product file could not be linked to this product. Please try again.", 503);
  }
}
