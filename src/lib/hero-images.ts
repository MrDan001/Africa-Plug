import { list } from "@vercel/blob";
import { unstable_cache } from "next/cache";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";

export type HeroImageState = {
  images: (string | null)[];
  mobileImages: (string | null)[];
  githubImages: (string | null)[];
  githubMobileImages: (string | null)[];
  storage: "not-configured" | "vercel-blob" | "github" | "error";
};

type HeroBlob = { url: string; pathname: string; uploadedAt: string | Date };

// Blob list() is an advanced operation. Cache the result across requests so normal
// homepage visits do not consume one advanced operation each.
const listHomepageHeroBlobs = unstable_cache(
  async (): Promise<HeroBlob[]> => {
    if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
    const { blobs } = await list({ prefix: "homepage/hero-slide-" });
    return blobs.map((blob) => ({ url: blob.url, pathname: blob.pathname, uploadedAt: blob.uploadedAt }));
  },
  ["africa-plug-homepage-hero-blob-list-v1"],
  { revalidate: 600, tags: ["africa-plug-homepage-hero-blob-list"] },
);

function versionedUrl(blob: HeroBlob) {
  const version = new Date(blob.uploadedAt).getTime();
  return `${blob.url}${blob.url.includes("?") ? "&" : "?"}v=${version}`;
}

export async function getHeroImageState(): Promise<HeroImageState> {
  // Repository paths are the zero-operation fallback. Blob remains the preferred
  // source when it is available and has a published crop for a slot.
  const fallbackDesktop: (string | null)[] = [
    "/images/Hero/work-with-fk-hero.jpg",
    "/images/Hero/tap-in-hero.jpg",
    "/images/Hero/ask-fk.jpg",
  ];
  let githubDesktop: (string | null)[] = [null, null, null];
  let githubMobile: (string | null)[] = [null, null, null];
  try {
    const settings = await cmsBridge<{ records?: CmsRecord[] }>({
      action: "cms.list",
      module: "site-settings",
      status: "active",
    });
    const record = settings.records?.find((item) => item.slug === "site-settings") ?? settings.records?.[0];
    const paths = record?.data?.heroImagePaths as { desktop?: unknown[]; mobile?: unknown[] } | undefined;
    const safePath = (value: unknown) =>
      typeof value === "string" &&
      /^\/(?:Image|images)\/[a-zA-Z0-9_./-]+\.(?:jpe?g|png|webp|avif|gif|svg)$/i.test(value) &&
      !value.includes("..") && !value.includes("//")
        ? value
        : null;
    githubDesktop = [0, 1, 2].map((index) => safePath(paths?.desktop?.[index]));
    githubMobile = [0, 1, 2].map((index) => safePath(paths?.mobile?.[index]));
  } catch {
    // A missing CMS configuration must not prevent repository-hosted defaults.
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      images: githubDesktop.map((path, index) => path ?? fallbackDesktop[index]),
      mobileImages: githubMobile.map((path, index) => path ?? githubDesktop[index] ?? fallbackDesktop[index]),
      githubImages: githubDesktop,
      githubMobileImages: githubMobile,
      storage: "github",
    };
  }

  try {
    const blobs = await listHomepageHeroBlobs();
    const latestFor = (slot: number, variant: "desktop" | "mobile"): HeroBlob | null => {
      const extensions = "(jpg|png|webp|avif)";
      const variantPattern = new RegExp(`^homepage/hero-slide-${slot}-${variant}(?:-[^/]*)?\\.${extensions}$`, "i");
      let candidates = blobs.filter((blob) => variantPattern.test(blob.pathname));
      if (variant === "desktop" && !candidates.length) {
        const legacyPattern = new RegExp(`^homepage/hero-slide-${slot}(?:-[^/]*)?\\.${extensions}$`, "i");
        candidates = blobs.filter((blob) => legacyPattern.test(blob.pathname) && !new RegExp(`^homepage/hero-slide-${slot}-mobile(?:-|\\.)`, "i").test(blob.pathname));
      }
      return candidates.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0] ?? null;
    };

    const desktop = [1, 2, 3].map((slot) => latestFor(slot, "desktop"));
    const mobile = [1, 2, 3].map((slot) => latestFor(slot, "mobile"));
    // An explicitly saved GitHub path takes priority for that slot. Otherwise
    // retain Blob as the primary source and use the committed image as fallback.
    const images = desktop.map((blob, index) => githubDesktop[index] ?? (blob ? versionedUrl(blob) : fallbackDesktop[index]));
    const mobileImages = mobile.map((blob, index) => {
      const desktopBlob = desktop[index];
      if (githubMobile[index]) return githubMobile[index];
      if (blob && (!desktopBlob || new Date(blob.uploadedAt).getTime() >= new Date(desktopBlob.uploadedAt).getTime())) return versionedUrl(blob);
      return githubDesktop[index] ?? (desktopBlob ? versionedUrl(desktopBlob) : fallbackDesktop[index]);
    });
    return { images, mobileImages, githubImages: githubDesktop, githubMobileImages: githubMobile, storage: "vercel-blob" };
  } catch (error) {
    console.error("Could not list homepage hero images:", error instanceof Error ? error.message : "Unknown error");
    return {
      images: githubDesktop.map((path, index) => path ?? fallbackDesktop[index]),
      mobileImages: githubMobile.map((path, index) => path ?? githubDesktop[index] ?? fallbackDesktop[index]),
      githubImages: githubDesktop,
      githubMobileImages: githubMobile,
      storage: "github",
    };
  }
}
