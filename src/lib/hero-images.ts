import { list } from "@vercel/blob";
import { unstable_cache } from "next/cache";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";

export type HeroImageState = {
  images: (string | null)[];
  mobileImages: (string | null)[];
  githubImages: (string | null)[];
  githubMobileImages: (string | null)[];
  storage: "not-configured" | "vercel-blob" | "supabase" | "github" | "error";
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
  const fallbackMobile: (string | null)[] = [
    "/images/Hero/mobile/work-with-fk-mobile.jpg",
    "/images/Hero/mobile/tap-in-mobile.jpg",
    "/images/Hero/mobile/ask-fk-mobile.jpg",
  ];
  let githubDesktop: (string | null)[] = [...fallbackDesktop];
  let githubMobile: (string | null)[] = [null, null, null];
  try {
    const settings = await cmsBridge<{ records?: CmsRecord[] }>({
      action: "cms.list",
      module: "site-settings",
      status: "active",
    });
    const record = settings.records?.find((item) => item.slug === "site-settings") ?? settings.records?.[0];
    const paths = record?.data?.heroImagePaths as { desktop?: unknown[]; mobile?: unknown[] } | undefined;
    const safePath = (value: unknown) => {
      if (typeof value !== "string" || value.includes("..")) return null;
      if (/^\\/images\\/[a-zA-Z0-9_./-]+\\.(?:jpe?g|png|webp|avif|gif|svg)$/i.test(value) && !value.includes("//")) return value;
      try {
        const candidate = new URL(value);
        const configured = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL) : null;
        if (
          candidate.protocol === "https:" &&
          configured &&
          candidate.origin === configured.origin &&
          candidate.pathname.startsWith("/storage/v1/object/public/africa-plug-media/") &&
          !candidate.pathname.includes("//")
        ) return value;
      } catch {
        return null;
      }
      return null;
    };
    githubDesktop = [0, 1, 2].map((index) => safePath(paths?.desktop?.[index]) ?? fallbackDesktop[index]);
    githubMobile = [0, 1, 2].map((index) => safePath(paths?.mobile?.[index]));
  } catch {
    // A missing CMS configuration must not prevent repository-hosted defaults.
  }

  const displayGithubMobile = githubMobile.map((path, index) => path ?? fallbackMobile[index]);

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      images: githubDesktop.map((path, index) => path ?? fallbackDesktop[index]),
      mobileImages: displayGithubMobile.map((path, index) => path ?? githubDesktop[index] ?? fallbackDesktop[index]),
      githubImages: githubDesktop,
      githubMobileImages: displayGithubMobile,
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
    // Keep the committed desktop assets authoritative; uploaded Blob images are
    // only considered for mobile crops below.
    const images = githubDesktop.map((path, index) => path ?? fallbackDesktop[index]);
    const mobileImages = mobile.map((blob, index) => {
      const desktopBlob = desktop[index];
      if (githubMobile[index]) return githubMobile[index];
      if (blob && (!desktopBlob || new Date(blob.uploadedAt).getTime() >= new Date(desktopBlob.uploadedAt).getTime())) return versionedUrl(blob);
      return fallbackMobile[index] ?? githubDesktop[index] ?? fallbackDesktop[index];
    });
    return { images, mobileImages, githubImages: githubDesktop, githubMobileImages: displayGithubMobile, storage: "vercel-blob" };
  } catch (error) {
    console.error("Could not list homepage hero images:", error instanceof Error ? error.message : "Unknown error");
    return {
      images: githubDesktop.map((path, index) => path ?? fallbackDesktop[index]),
      mobileImages: githubMobile.map((path, index) => path ?? fallbackMobile[index] ?? githubDesktop[index] ?? fallbackDesktop[index]),
      githubImages: githubDesktop,
      githubMobileImages: displayGithubMobile,
      storage: "github",
    };
  }
}
