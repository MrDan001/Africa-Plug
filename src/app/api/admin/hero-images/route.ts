import { put } from "@vercel/blob";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) {
    return Response.json({ error: "Please sign in to the admin workspace." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: "Vercel Blob is not connected to this deployment. Connect a Blob store and redeploy." }, { status: 503 });
  }
  let formData: FormData;
  try { formData = await request.formData(); }
  catch { return Response.json({ error: "The upload could not be read. Please select an image and try again." }, { status: 400 }); }

  const slotValue = formData.get("slot");
  const file = formData.get("image");
  const variantValue = formData.get("variant") === "mobile" ? "mobile" : formData.get("variant") === "desktop" ? "desktop" : "desktop";
  if (slotValue !== "1" && slotValue !== "2" && slotValue !== "3") return Response.json({ error: "Choose Hero 1, Hero 2, or Hero 3." }, { status: 400 });
  if (!(file instanceof File)) return Response.json({ error: "Select an image to upload." }, { status: 400 });
  const extension = ACCEPTED_IMAGE_TYPES.get(file.type);
  if (!extension) return Response.json({ error: "Use a JPG, PNG, WebP, or AVIF image. SVG files are not accepted." }, { status: 415 });
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) return Response.json({ error: "The image must be smaller than 10 MB." }, { status: 413 });

  try {
    const blob = await put(`homepage/hero-slide-${slotValue}-${variantValue}.${extension}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
      cacheControlMaxAge: 60 * 60,
    });
    return Response.json(
      { ok: true, slot: Number(slotValue), variant: variantValue, imageUrl: blob.url },
      { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Blob upload error";
    console.error("Hero image Blob upload failed:", message);
    const privateStore = /private store/i.test(message);
    return Response.json({
      error: privateStore
        ? "This Blob store is configured as Private. Homepage hero images need a Public Blob store. Change the tapin store access to Public in Vercel Storage, then retry."
        : `Vercel Blob could not save this image: ${message}`,
    }, { status: 502, headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } });
  }
}
