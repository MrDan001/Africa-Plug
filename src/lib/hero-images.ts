import { list } from "@vercel/blob";

export type HeroImageState = {
  images: (string | null)[];
  mobileImages: (string | null)[];
  storage: "not-configured" | "vercel-blob" | "error";
};

function versionedUrl(blob: { url: string; uploadedAt: string }) {
  const version = new Date(blob.uploadedAt).getTime();
  return `${blob.url}${blob.url.includes("?") ? "&" : "?"}v=${version}`;
}

export async function getHeroImageState(): Promise<HeroImageState> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { images: [null, null, null], mobileImages: [null, null, null], storage: "not-configured" };
  }

  try {
    const { blobs } = await list({ prefix: "homepage/hero-slide-" });
    const latestFor = (slot: number, variant: "desktop" | "mobile") => {
      const extensions = "(jpg|png|webp|avif)";
      const variantPattern = new RegExp(`^homepage/hero-slide-${slot}-${variant}(?:-[^/]*)?\\.${extensions}$`, "i");
      let candidates = blobs.filter((blob) => variantPattern.test(blob.pathname));
      // Older uploads used the slide number without a desktop/mobile suffix. Treat them as desktop only.
      if (variant === "desktop" && !candidates.length) {
        const legacyPattern = new RegExp(`^homepage/hero-slide-${slot}(?:-[^/]*)?\\.${extensions}$`, "i");
        candidates = blobs.filter((blob) => legacyPattern.test(blob.pathname) && !new RegExp(`^homepage/hero-slide-${slot}-mobile(?:-|\\.)`, "i").test(blob.pathname));
      }
      const latest = candidates.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0];
      return latest ? versionedUrl(latest) : null;
    };
    return {
      images: [1, 2, 3].map((slot) => latestFor(slot, "desktop")),
      mobileImages: [1, 2, 3].map((slot) => latestFor(slot, "mobile")),
      storage: "vercel-blob",
    };
  } catch (error) {
    console.error("Could not list homepage hero images:", error instanceof Error ? error.message : "Unknown error");
    return { images: [null, null, null], mobileImages: [null, null, null], storage: "error" };
  }
}
