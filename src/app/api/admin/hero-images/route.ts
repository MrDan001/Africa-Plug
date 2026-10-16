export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function publicObjectUrl(baseUrl: string, bucket: string, path: string, version: string) {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}?v=${encodeURIComponent(version)}`;
}

export async function POST(request: Request) {
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "africa-plug-media";

  if (!baseUrl || !serviceKey) {
    return Response.json(
      { error: "Image storage is not configured yet. Follow docs/HERO_IMAGE_ADMIN_SETUP.md to connect the storage bucket." },
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
  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    return Response.json({ error: "Use a JPG, PNG, WebP, or AVIF image. SVG files are not accepted." }, { status: 415 });
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    return Response.json({ error: "The image must be smaller than 10 MB." }, { status: 413 });
  }

  const path = `homepage/hero-slide-${slotValue}`;
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  // Supabase legacy service_role keys are JWTs and belong in Authorization.
  // New sb_secret_ keys are not JWTs: use them as apikey only, otherwise
  // Storage rejects the Bearer token as an invalid JWT/API key.
  const headers: Record<string, string> = {
    apikey: serviceKey,
    "Content-Type": file.type,
    "Cache-Control": "max-age=3600",
    "x-upsert": "true",
  };
  if (serviceKey.startsWith("eyJ")) {
    headers.Authorization = `Bearer ${serviceKey}`;
  }

  let storageResponse: Response;
  try {
    storageResponse = await fetch(`${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`, {
      method: "POST",
      headers,
      body: Buffer.from(await file.arrayBuffer()),
      cache: "no-store",
    });
  } catch {
    return Response.json({ error: "Could not reach image storage. Please try again." }, { status: 502 });
  }

  if (!storageResponse.ok) {
    const detail = await storageResponse.text();
    console.error("Hero image upload failed:", storageResponse.status, detail.slice(0, 500));
    const normalized = detail.toLowerCase();
    let message = "The upload failed. Check that the storage bucket exists and that the storage credentials are correct.";
    if (normalized.includes("invalid api key") || normalized.includes("invalid jwt")) {
      message = "Supabase rejected the storage API key. Check SUPABASE_SERVICE_ROLE_KEY in Vercel and redeploy.";
    } else if (normalized.includes("bucket") && (normalized.includes("not found") || normalized.includes("does not exist"))) {
      message = `The Supabase storage bucket "${bucket}" does not exist. Create it in Supabase Storage and make it public.`;
    } else if (normalized.includes("row-level security") || normalized.includes("permission denied")) {
      message = "Supabase denied the upload. Check that Vercel uses the server-side service/secret key, not the publishable key.";
    }
    return Response.json({ error: message }, { status: 502 });
  }

  return Response.json({
    ok: true,
    slot: Number(slotValue),
    imageUrl: publicObjectUrl(baseUrl, bucket, path, String(Date.now())),
  }, { headers: { "Cache-Control": "no-store" } });
}
