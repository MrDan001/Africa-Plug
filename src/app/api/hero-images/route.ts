export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StoredObject = { name?: string; updated_at?: string | null };

function publicObjectUrl(baseUrl: string, bucket: string, path: string, version: string) {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}?v=${encodeURIComponent(version)}`;
}

export async function GET() {
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "africa-plug-media";

  if (!baseUrl || !serviceKey) {
    return Response.json({ images: [null, null, null] }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const response = await fetch(`${baseUrl}/storage/v1/object/list/${encodeURIComponent(bucket)}`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prefix: "homepage/",
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return Response.json({ images: [null, null, null] }, { headers: { "Cache-Control": "no-store" } });
    }

    const objects = await response.json() as StoredObject[];
    const images = [1, 2, 3].map((slot) => {
      const filename = `hero-slide-${slot}`;
      const object = objects.find((item) => item.name === filename || item.name === `homepage/${filename}`);
      if (!object) return null;
      const version = object.updated_at ? String(Date.parse(object.updated_at) || Date.now()) : String(Date.now());
      return publicObjectUrl(baseUrl, bucket, `homepage/${filename}`, version);
    });

    return Response.json({ images }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ images: [null, null, null] }, { headers: { "Cache-Control": "no-store" } });
  }
}
