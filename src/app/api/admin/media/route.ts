import { put } from "@vercel/blob";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 20 * 1024 * 1024;
const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "application/pdf"]);

export async function GET() {
  if (!await isAdminAuthenticated()) return Response.json({ error: "Please sign in to the admin workspace." }, { status: 401 });
  try {
    const result = await cmsBridge<{ records?: CmsRecord[] }>({ action: "cms.list", module: "media", status: "all" });
    return Response.json({ records: result.records ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not load the media library." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) return Response.json({ error: "Please sign in to the admin workspace." }, { status: 401 });

  // Register a repository-hosted image without making a Blob request.
  if (request.headers.get("content-type")?.includes("application/json")) {
    let input: { url?: string; title?: string };
    try { input = await request.json() as typeof input; }
    catch { return Response.json({ error: "Submit a valid GitHub image path." }, { status: 400 }); }
    const url = typeof input.url === "string" ? input.url.trim() : "";
    if (!/^\/(?:Image|images)\/[a-zA-Z0-9_./-]+\.(?:jpe?g|png|webp|avif|gif|svg)$/i.test(url) || url.includes("..") || url.includes("//")) {
      return Response.json({ error: "Use a repository image path such as /Image/Store/cover.jpg. Paths must point inside the public image library." }, { status: 400 });
    }
    try {
      const result = await cmsBridge<{ record: CmsRecord }>({
        action: "cms.save",
        module: "media",
        record: {
          title: (typeof input.title === "string" && input.title.trim() ? input.title.trim() : url.split("/").pop() || "GitHub image").slice(0, 240),
          slug: `asset-${crypto.randomUUID()}`,
          status: "active",
          data: { url, source: "github", pathname: url, fileName: url.split("/").pop(), contentType: "image", size: 0, uploadedAt: new Date().toISOString() },
        },
      });
      return Response.json({ ok: true, record: result.record }, { status: 201, headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      return Response.json({ error: error instanceof Error ? error.message : "Could not register the GitHub image." }, { status: 503 });
    }
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) return Response.json({ error: "Vercel Blob is currently unavailable or not connected. You can still register an image from the GitHub Image library." }, { status: 503 });
  let form: FormData;
  try { form = await request.formData(); }
  catch { return Response.json({ error: "Choose an asset to upload." }, { status: 400 }); }
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Choose an image or PDF file." }, { status: 400 });
  if (!ACCEPTED.has(file.type)) return Response.json({ error: "Use JPG, PNG, WebP, AVIF or PDF files." }, { status: 415 });
  if (file.size <= 0 || file.size > MAX_BYTES) return Response.json({ error: "The file must be smaller than 20 MB." }, { status: 413 });

  const safeName = file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(-100) || "asset";
  try {
    const blob = await put(`media/${Date.now()}-${safeName}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
      cacheControlMaxAge: 60 * 60,
    });
    const result = await cmsBridge<{ record: CmsRecord }>({
      action: "cms.save",
      module: "media",
      record: {
        title: file.name.slice(0, 240),
        slug: `asset-${crypto.randomUUID()}`,
        status: "active",
        data: { url: blob.url, pathname: blob.pathname, fileName: file.name, contentType: file.type, size: file.size, uploadedAt: new Date().toISOString() },
      },
    });
    return Response.json({ ok: true, record: result.record }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Media upload failed:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: error instanceof Error ? error.message : "Could not save the media asset." }, { status: 503 });
  }
}
