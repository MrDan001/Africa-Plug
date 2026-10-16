import { list } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ images: [null, null, null], storage: "not-configured" }, { headers: { "Cache-Control": "no-store" } });
  }
  try {
    const { blobs } = await list({ prefix: "homepage/" });
    const images = [1, 2, 3].map((slot) => {
      const blob = blobs.find((item) => new RegExp(`^homepage/hero-slide-${slot}\\.(jpg|png|webp|avif)$`, "i").test(item.pathname));
      if (!blob) return null;
      const version = blob.uploadedAt ? new Date(blob.uploadedAt).getTime() : Date.now();
      return `${blob.url}${blob.url.includes("?") ? "&" : "?"}v=${version}`;
    });
    return Response.json({ images, storage: "vercel-blob" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Could not list homepage hero images:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ images: [null, null, null], storage: "error" }, { headers: { "Cache-Control": "no-store" } });
  }
}
