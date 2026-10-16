import { put } from "@vercel/blob";

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
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      { error: "Vercel Blob is not configured. Connect a Blob store to the Africa Plug project and redeploy." },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "The upload could not be read. Please select an image and try again." }, { status: 400 });
  }

  const slotValue = formData.get("slot");
  const file = formData.get("image");

  if (slotValue !== "1" && slotValue !== "2" && slotValue !== "3") {
    return Response.json({ error: "Choose Hero 1, Hero 2, or Hero 3." }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return Response.json({ error: "Select an image to upload." }, { status: 400 });
  }

  const extension = ACCEPTED_IMAGE_TYPES.get(file.type);
  if (!extension) {
    return Response.json({ error: "Use a JPG, PNG, WebP, or AVIF image. SVG files are not accepted." }, { status: 415 });
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    return Response.json({ error: "The image must be smaller than 10 MB." }, { status: 413 });
  }

  try {
    const pathname = `homepage/hero-slide-${slotValue}.${extension}`;
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: file.type,
      cacheControlMaxAge: 60 * 60,
    });

    return Response.json(
      { ok: true, slot: Number(slotValue), imageUrl: blob.url },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Blob upload error";
    console.error("Hero image Blob upload failed:", message);
    return Response.json(
      { error: "Vercel Blob could not save this image. Check the Blob store connection and BLOB_READ_WRITE_TOKEN configuration." },
      { status: 502 },
    );
  }
}
