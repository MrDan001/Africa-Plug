import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";
import { getSupabaseServiceRoleKey } from "@/lib/supabase-service-role";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "africa-plug-media";
const MAX_BYTES = 20 * 1024 * 1024;
const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "application/pdf"]);
type UploadAction =
  | { action: "create-upload"; fileName?: string; contentType?: string; size?: number }
  | { action: "finalize-upload"; path?: string; fileName?: string; contentType?: string; size?: number };

function failure(message: string, status = 400) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

function storageConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim();
  const serviceKey = url ? getSupabaseServiceRoleKey(url) : null;
  if (!url || !anonKey || !serviceKey) throw new Error("Supabase media storage is not configured for this deployment.");
  return { url, anonKey, serviceKey };
}

async function ensurePublicMediaBucket(storage: SupabaseClient<any, "public", "public", any, any>) {
  const options = { public: true, fileSizeLimit: MAX_BYTES, allowedMimeTypes: [...ACCEPTED] };
  const { data: bucket, error: lookupError } = await storage.storage.getBucket(BUCKET);
  if (lookupError) {
    const { error } = await storage.storage.createBucket(BUCKET, options);
    if (error && !/already exists|duplicate/i.test(error.message)) throw error;
    return;
  }
  if (!bucket.public || bucket.file_size_limit !== MAX_BYTES) {
    const { error } = await storage.storage.updateBucket(BUCKET, options);
    if (error) throw error;
  }
}

function safeFileName(value: string) {
  return value.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(-100) || "asset";
}

export async function GET() {
  if (!await isAdminAuthenticated()) return failure("Please sign in to the admin workspace.", 401);
  try {
    const result = await cmsBridge<{ records?: CmsRecord[] }>({ action: "cms.list", module: "media", status: "all" });
    return Response.json({ records: result.records ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Could not load the media library.", 503);
  }
}

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) return failure("Please sign in to the admin workspace.", 401);

  if (request.headers.get("content-type")?.includes("application/json")) {
    let input: UploadAction | { url?: string; title?: string };
    try { input = await request.json() as typeof input; }
    catch { return failure("Submit a valid upload request."); }

    // Register a repository-hosted image without uploading a file.
    if ("url" in input) {
      const url = typeof input.url === "string" ? input.url.trim() : "";
      if (!/^\/(?:Image|images)\/[a-zA-Z0-9_./-]+\.(?:jpe?g|png|webp|avif|gif|svg)$/i.test(url) || url.includes("..") || url.includes("//")) {
        return failure("Use a repository image path such as /Image/Store/cover.jpg.");
      }
      try {
        const result = await cmsBridge<{ record: CmsRecord }>({
          action: "cms.save", module: "media",
          record: {
            title: (typeof input.title === "string" && input.title.trim() ? input.title.trim() : url.split("/").pop() || "GitHub image").slice(0, 240),
            slug: `asset-${randomUUID()}`, status: "active",
            data: { url, source: "github", pathname: url, fileName: url.split("/").pop(), contentType: "image", size: 0, uploadedAt: new Date().toISOString() },
          },
        });
        return Response.json({ ok: true, record: result.record }, { status: 201, headers: { "Cache-Control": "no-store" } });
      } catch (error) {
        return failure(error instanceof Error ? error.message : "Could not register the GitHub image.", 503);
      }
    }

    const action = input as UploadAction;
    let config: ReturnType<typeof storageConfig>;
    try { config = storageConfig(); }
    catch (error) { return failure(error instanceof Error ? error.message : "Supabase media storage is not configured.", 503); }
    const storage = createClient(config.url, config.serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    try {
      if (action.action === "create-upload") {
        const fileName = typeof action.fileName === "string" ? action.fileName : "";
        const contentType = typeof action.contentType === "string" ? action.contentType : "";
        const size = Number(action.size);
        if (!ACCEPTED.has(contentType)) return failure("Use JPG, PNG, WebP, AVIF or PDF files.");
        if (!Number.isFinite(size) || size < 1 || size > MAX_BYTES) return failure("The file must be smaller than 20 MB.");
        await ensurePublicMediaBucket(storage);
        const path = `cms-media/${randomUUID()}-${safeFileName(fileName)}`;
        const { data, error } = await storage.storage.from(BUCKET).createSignedUploadUrl(path, { upsert: false });
        if (error || !data?.token) throw error ?? new Error("Supabase did not return a signed upload token.");
        return Response.json({ bucket: BUCKET, path, token: data.token, supabaseUrl: config.url, anonKey: config.anonKey }, { headers: { "Cache-Control": "no-store" } });
      }

      if (action.action === "finalize-upload") {
        const path = typeof action.path === "string" ? action.path : "";
        const fileName = typeof action.fileName === "string" ? action.fileName.slice(0, 180) : "";
        const contentType = typeof action.contentType === "string" ? action.contentType : "";
        const size = Number(action.size);
        if (!/^cms-media\/[a-f0-9-]{36}-[A-Za-z0-9._-]{1,100}$/i.test(path)) return failure("The uploaded media path is invalid.");
        if (!ACCEPTED.has(contentType)) return failure("The media file type is not supported.");
        if (!Number.isFinite(size) || size < 1 || size > MAX_BYTES) return failure("The media file size is not valid.");
        const storedName = path.split("/").pop()!;
        const { data: objects, error: listError } = await storage.storage.from(BUCKET).list("cms-media", { search: storedName, limit: 20 });
        if (listError) throw listError;
        if (!objects?.some((item) => item.name === storedName)) return failure("Supabase has not received this file yet. Please retry the upload.", 409);
        const { data: publicData } = storage.storage.from(BUCKET).getPublicUrl(path);
        if (!publicData.publicUrl) throw new Error("Supabase did not return a public media URL.");
        const result = await cmsBridge<{ record: CmsRecord }>({
          action: "cms.save", module: "media",
          record: {
            title: fileName || storedName, slug: `asset-${randomUUID()}`, status: "active",
            data: { url: publicData.publicUrl, pathname: path, fileName: fileName || storedName, contentType, size, uploadedAt: new Date().toISOString(), source: "supabase" },
          },
        });
        return Response.json({ ok: true, record: result.record }, { status: 201, headers: { "Cache-Control": "no-store" } });
      }
      return failure("This media upload action is not supported.");
    } catch (error) {
      console.error("Supabase media upload failed:", error instanceof Error ? error.message : "Unknown error");
      return failure(error instanceof Error ? error.message : "Could not save the media asset.", 503);
    }
  }

  return failure("Use the secure Supabase signed-upload flow to upload media.", 415);
}
