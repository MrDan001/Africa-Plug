import { list } from "@vercel/blob";
import { unstable_cache } from "next/cache";

export type HeroImageState = {
  images: (string | null)[];
  mobileImages: (string | null)[];
  storage: "not-configured" | "vercel-blob" | "error";
};

type HeroBlob = { url: string; pathname: string; uploadedAt: string | Date };

// Blob list() is an advanced operation. Cache the result across requests so normal
// homepage visits do not consume one advanced operation each.
const listHomepageHeroBlobs = unstable_cache(
  async (): Promise<HeroBlob[]> => {
    if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
    const blobs = await listHomepageHeroBlobs();
    return blobs.map((blob) => ({ url: blob.url, pathname: blob.pathname, uploadedAt: blob.uploadedAt }));
  },
  ["africa-plug-homepage-hero-blob-list-v1"],
  { revalidate: 600 },
);

function versionedUrl(blob: HeroBlob) {
  const version = new Date(blob.uploadedAt).getTime();
  return `${blob.url}${blob.url.includes("?") ? "&" : "?"}v=${version}`;
}

export async function getHeroImageState(): Promise<HeroImageState> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { images: [null, null, null], mobileImages: [null, null, null], storage: "not-configured" };
  }

  try {
    const { blobs } = await list({ prefix: "homepage/hero-slide-" });
    const latestFor = (slot: number, variant: "desktop" | "mobile"): HeroBlob | null => {
      const extensions = "(jpg|png|webp|avif)";
      const variantPattern = new RegExp(`^homepage/hero-slide-${slot}-${variant}(?:-[^/]*)?\\.${extensions}$`, "i");
      let candidates = blobs.filter((blob) => variantPattern.test(blob.pathname));
      // Older uploads used the slide number without a desktop/mobile suffix. Treat them as desktop only.
      if (variant === "desktop" && !candidates.length) {
        const legacyPattern = new RegExp(`^homepage/hero-slide-${slot}(?:-[^/]*)?\\.${extensions}$`, "i");
        candidates = blobs.filter((blob) => legacyPattern.test(blob.pathname) && !new RegExp(`^homepage/hero-slide-${slot}-mobile(?:-|\\.)`, "i").test(blob.pathname));
      }
      return candidates.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0] ?? null;
    };

    const desktop = [1, 2, 3].map((slot) => latestFor(slot, "desktop"));
    const mobile = [1, 2, 3].map((slot) => latestFor(slot, "mobile"));

    return {
      images: desktop.map((blob) => blob ? versionedUrl(blob) : null),
      // A desktop upload is the newest published artwork and must appear on every device.
      // Keep a dedicated mobile crop only when it was uploaded after the desktop image.
      mobileImages: mobile.map((blob, index) => {
        const desktopBlob = desktop[index];
        if (!blob) return null;
        if (desktopBlob && new Date(desktopBlob.uploadedAt).getTime() > new Date(blob.uploadedAt).getTime()) return null;
        return versionedUrl(blob);
      }),
      storage: "vercel-blob",
    };
  } catch (error) {
    console.error("Could not list homepage hero images:", error instanceof Error ? error.message : "Unknown error");
    return { images: [null, null, null], mobileImages: [null, null, null], storage: "error" };
  }
}
