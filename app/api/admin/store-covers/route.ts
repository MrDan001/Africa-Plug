import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";
import { getSupabaseServiceRoleKey } from "@/lib/supabase-service-role";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "africa-plug-media";
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

type UploadAction =
  | { action: "create-upload"; fileName?: string; contentType?: string; size?: number }
  | { action: "finalize-upload"; path?: string; fileName?: string; contentType?: string; size?: number };

function failure(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

function storageConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim();
  const serviceKey = url ? getSupabaseServiceRoleKey(url) : null;
  if (!url || !anonKey || !serviceKey) {
    throw new Error("Public Supabase media storage is not configured for this deployment.");
  }
  return { url, anonKey, serviceKey };
}

async function ensurePublicMediaBucket(storage: SupabaseClient<any, "public", "public", any, any>) {
  const options = {
    public: true,
    fileSizeLimit: MAX_IMAGE_BYTES,
    allowedMimeTypes: ACCEPTED_TYPES,
  };
  const { data: bucket, error: lookupError } = await storage.storage.getBucket(BUCKET);

  if (lookupError) {
    const { error: createError } = await storage.storage.createBucket(BUCKET, options);
    if (createError && !/already exists|duplicate/i.test(createError.message)) {
      throw createError;
    }
    return;
  }

  if (!bucket.public || bucket.file_size_limit !== MAX_IMAGE_BYTES) {
    const { error: updateError } = await storage.storage.updateBucket(BUCKET, options);
    if (updateError) throw updateError;
  }
}

function safeFileName(value: string) {
  return value.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(-100) || "cover";
}

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) return failure("Please sign in to the admin workspace.", 401);

  let input: UploadAction;
  try {
    input = await request.json() as UploadAction;
  } catch {
    return failure("Please submit a valid product-cover upload request.");
  }

  let config: ReturnType<typeof storageConfig>;
  try {
    config = storageConfig();
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Supabase media storage is not configured.", 503);
  }

  const storage = createClient(config.url, config.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    if (input.action === "create-upload") {
      const fileName = typeof input.fileName === "string" ? input.fileName : "";
      const contentType = typeof input.contentType === "string" ? input.contentType : "";
      const size = Number(input.size);
      if (!ACCEPTED_TYPES.includes(contentType)) return failure("Use a JPG, PNG, WebP or AVIF image.");
      if (!Number.isFinite(size) || size < 1 || size > MAX_IMAGE_BYTES) return failure("The product cover must be smaller than 20 MB.");

      await ensurePublicMediaBucket(storage);
      const path = `store-products/${randomUUID()}-${safeFileName(fileName)}`;
      const { data, error } = await storage.storage.from(BUCKET).createSignedUploadUrl(path, { upsert: false });
      if (error || !data?.token) throw error ?? new Error("Supabase did not return a signed upload token.");

      return NextResponse.json({
        bucket: BUCKET,
        path,
        token: data.token,
        supabaseUrl: config.url,
        anonKey: config.anonKey,
      }, { headers: { "Cache-Control": "no-store" } });
    }

    if (input.action === "finalize-upload") {
      const path = typeof input.path === "string" ? input.path : "";
      const fileName = typeof input.fileName === "string" ? input.fileName.slice(0, 180) : "";
      const contentType = typeof input.contentType === "string" ? input.contentType : "";
      const size = Number(input.size);
      if (!/^store-products\/[a-f0-9-]{36}-[A-Za-z0-9._-]{1,100}$/i.test(path)) return failure("The uploaded product-cover path is invalid.");
      if (!ACCEPTED_TYPES.includes(contentType)) return failure("The product-cover image type is not supported.");
      if (!Number.isFinite(size) || size < 1 || size > MAX_IMAGE_BYTES) return failure("The product-cover image size is not valid.");

      const fileNameOnStorage = path.split("/").pop()!;
      const { data: objects, error: listError } = await storage.storage.from(BUCKET).list("store-products", {
        search: fileNameOnStorage,
        limit: 20,
      });
      if (listError) throw listError;
      if (!objects?.some((item) => item.name === fileNameOnStorage)) {
        return failure("Supabase has not received this image yet. Please retry the upload.", 409);
      }

      const { data: publicData } = storage.storage.from(BUCKET).getPublicUrl(path);
      if (!publicData.publicUrl) throw new Error("Supabase did not return a public image URL.");
      const result = await cmsBridge<{ record: CmsRecord }>({
        action: "cms.save",
        module: "media",
        record: {
          title: fileName || fileNameOnStorage,
          slug: `asset-${randomUUID()}`,
          status: "active",
          data: {
            url: publicData.publicUrl,
            pathname: path,
            fileName: fileName || fileNameOnStorage,
            contentType,
            size,
            uploadedAt: new Date().toISOString(),
            source: "supabase",
            usage: "store-product-cover",
          },
        },
      });

      return NextResponse.json({ ok: true, record: result.record }, {
        status: 201,
        headers: { "Cache-Control": "no-store" },
      });
    }

    return failure("This product-cover upload action is not supported.");
  } catch (error) {
    console.error("Store product cover upload failed:", error instanceof Error ? error.message : "Unknown error");
    return failure(error instanceof Error ? error.message : "The product cover could not be uploaded.", 503);
  }
}
