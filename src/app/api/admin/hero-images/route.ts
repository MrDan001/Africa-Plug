import { createClient } from "@supabase/supabase-js";

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
      { error: "Image storage is not configured yet. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel." },
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

  // Let the official SDK handle modern Supabase secret-key authentication.
  // Do not force a legacy service_role JWT into Authorization: it may fail
  // verification when the project's JWT signing configuration has changed.
  const supabase = createClient(baseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const path = `homepage/hero-slide-${slotValue}`;
  const { error } = await supabase.storage.from(bucket).upload(path, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type,
    cacheControl: "3600",
    upsert: true,
  });

  if (error) {
    console.error("Hero image upload failed:", error.name, error.message);
    const normalized = error.message.toLowerCase();
    let message = "The upload failed. Check the Supabase secret key and storage bucket configuration.";
    if (normalized.includes("invalid api key") || normalized.includes("invalid jwt") || normalized.includes("unauthorized")) {
      message = "Supabase rejected SUPABASE_SERVICE_ROLE_KEY. Set it to the current sb_secret_ key from this Supabase project, then redeploy.";
    } else if (normalized.includes("bucket") && (normalized.includes("not found") || normalized.includes("does not exist"))) {
      message = `The Supabase storage bucket "${bucket}" does not exist. Create it in Supabase Storage.`;
    } else if (normalized.includes("row-level security") || normalized.includes("permission denied")) {
      message = "Supabase denied the upload. Confirm SUPABASE_SERVICE_ROLE_KEY is the secret key, not a publishable key.";
    }
    return Response.json({ error: message }, { status: 502 });
  }

  return Response.json({
    ok: true,
    slot: Number(slotValue),
    imageUrl: publicObjectUrl(baseUrl, bucket, path, String(Date.now())),
  }, { headers: { "Cache-Control": "no-store" } });
}
