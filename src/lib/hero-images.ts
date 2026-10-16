import { list } from "@vercel/blob";

export type HeroImageState = {
  images: (string | null)[];
  storage: "not-configured" | "vercel-blob" | "error";
};

export async function getHeroImageState(): Promise<HeroImageState> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { images: [null, null, null], storage: "not-configured" };
  }

  try {
    const { blobs } = await list({ prefix: "homepage/hero-slide-" });
    const images = [1, 2, 3].map((slot) => {
      // Random-suffix uploads avoid CDN cache collisions when a slide is replaced.
      // This pattern also recognises older files uploaded before random suffixes were enabled.
      const pattern = new RegExp(
        `^homepage/hero-slide-${slot}(?:-[^/]*)?\\.(jpg|png|webp|avif)$`,
        "i",
      );
      const latest = blobs
        .filter((blob) => pattern.test(blob.pathname))
        .sort(
          (a, b) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
        )[0];

      if (!latest) return null;
      const version = new Date(latest.uploadedAt).getTime();
      return `${latest.url}${latest.url.includes("?") ? "&" : "?"}v=${version}`;
    });

    return { images, storage: "vercel-blob" };
  } catch (error) {
    console.error(
      "Could not list homepage hero images:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return { images: [null, null, null], storage: "error" };
  }
}
