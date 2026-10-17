// FILE PATH: src/lib/cms-bridge.ts
import "server-only";
import { parseYouTubeId } from "@/lib/youtube";

export type CmsModule = "articles" | "products" | "applications" | "enquiries" | "subscribers" | "analytics" | "media" | "commercial-settings" | "site-settings";
export type CmsRecord = {
  id: string;
  module: CmsModule;
  title: string;
  slug: string | null;
  status: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

function bridgeConfig() {
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const secret = process.env.CMS_BRIDGE_SECRET;
  if (!baseUrl || !anonKey || !secret) {
    throw new Error("CMS_NOT_CONFIGURED: The CMS database bridge is not fully configured in the deployment environment.");
  }
  return { baseUrl, anonKey, secret };
}

export async function cmsBridge<T = Record<string, unknown>>(payload: Record<string, unknown>): Promise<T> {
  const { baseUrl, anonKey, secret } = bridgeConfig();
  const response = await fetch(`${baseUrl}/functions/v1/ap-cms-bridge`, {
    method: "POST",
    cache: "no-store",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      "x-ap-bridge-secret": secret,
    },
    body: JSON.stringify(payload),
  });
  let body: Record<string, unknown>;
  try { body = await response.json() as Record<string, unknown>; }
  catch { throw new Error("The CMS database returned an unreadable response."); }
  if (!response.ok) {
    const detail = [body.error, body.message, body.msg, body.error_description].find((value) => typeof value === "string") as string | undefined;
    throw new Error(detail ? `The CMS database operation failed (HTTP ${response.status}): ${detail}` : `The CMS database operation failed (HTTP ${response.status}).`);
  }
  return body as T;
}

export async function getPublicCmsRecords(module: "articles" | "products"): Promise<CmsRecord[]> {
  try {
    const result = await cmsBridge<{ records?: CmsRecord[] }>({ action: "cms.publicList", module })
      .catch(() => ({ records: [] }));
    return Array.isArray(result.records) ? result.records : [];
  } catch (error) {
    console.error("Could not load published CMS records safely:", error instanceof Error ? error.message : "Unknown error");
    return [];
  }
}

export async function getPublicCmsRecord(module: "articles" | "products", slug: string): Promise<CmsRecord | null> {
  if (!slug) return null;
  const records = await getPublicCmsRecords(module);
  return records.find((record) => record.slug === slug) ?? null;
}

export type PublicSiteSettings = {
  siteTitle?: string;
  siteDescription?: string;
  contactEmail?: string;
  whatsappUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  introVideoUrl?: string;
  intro_video_url?: string;
  introVideoId?: string;
  enableNewsletter?: boolean;
  enableSearch?: boolean;
  enableSelectedWork?: boolean;
  enableProductOfMonth?: boolean;
  tapInFilterThreshold?: number;
  navigation?: { label: string; href: string }[];
};

const DEFAULT_VIDEO_URL = "https://www.youtube.com/watch?v=KnY5dnnuLc4";

function fallbackSettings(navigation: { label: string; href: string }[]): PublicSiteSettings {
  return {
    navigation,
    youtubeUrl: DEFAULT_VIDEO_URL,
    introVideoUrl: DEFAULT_VIDEO_URL,
    intro_video_url: DEFAULT_VIDEO_URL,
    introVideoId: parseYouTubeId(DEFAULT_VIDEO_URL) ?? undefined,
    contactEmail: "connect@theafricaplug.com",
  };
}

const DEFAULT_PUBLIC_NAVIGATION = [
  { label: "TAP IN", href: "/tap-in" },
  { label: "STORE", href: "/store" },
  { label: "BLOG", href: "/blog" },
  { label: "CONTACT", href: "/contact" },
  { label: "ABOUT", href: "/about" },
];

function safeNavigation(value: unknown): { label: string; href: string }[] {
  if (!Array.isArray(value)) return DEFAULT_PUBLIC_NAVIGATION;
  const items = value.flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object") return [];
    const item = candidate as Record<string, unknown>;
    const label = typeof item.label === "string" ? item.label.trim().slice(0, 40) : "";
    const href = typeof item.href === "string" ? item.href.trim() : "";
    if (!label || !href.startsWith("/") || href.startsWith("//") || href.startsWith("/admin") || href.startsWith("/api")) return [];
    return [{ label, href: href.slice(0, 180) }];
  });
  return items.length ? items.slice(0, 12) : DEFAULT_PUBLIC_NAVIGATION;
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  try {
    const result = await cmsBridge<{ records?: CmsRecord[] }>({
      action: "cms.list",
      module: "site-settings",
      status: "active",
    }).catch(() => ({ records: [] }));

    const record = result.records?.find((item) => item.slug === "site-settings") ?? result.records?.[0];
    
    if (!record) {
      return fallbackSettings(DEFAULT_PUBLIC_NAVIGATION);
    }

    const data = record.data ?? {};
    const settingString = (key: string) => typeof data[key] === "string" ? (data[key] as string).trim().slice(0, 500) : undefined;
    const settingBool = (key: string) => typeof data[key] === "boolean" ? data[key] as boolean : undefined;
    const settingNumber = (key: string) => { const value = Number(data[key]); return Number.isFinite(value) && value >= 1 && value <= 100 ? Math.floor(value) : undefined; };
    
    const youtubeVal = settingString("youtubeUrl") || settingString("youtube_url") || DEFAULT_VIDEO_URL;
    const introVideoVal = settingString("introVideoUrl") || settingString("intro_video_url") || youtubeVal;
    // Prefer the dedicated intro link; fall back to the YouTube link, then the default film.
    const introVideoId = parseYouTubeId(introVideoVal) ?? parseYouTubeId(youtubeVal) ?? parseYouTubeId(DEFAULT_VIDEO_URL) ?? undefined;

    return {
      siteTitle: settingString("siteTitle"),
      siteDescription: settingString("siteDescription"),
      contactEmail: settingString("contactEmail") || "connect@theafricaplug.com",
      whatsappUrl: settingString("whatsappUrl"),
      linkedinUrl: settingString("linkedinUrl"),
      instagramUrl: settingString("instagramUrl"),
      youtubeUrl: youtubeVal,
      introVideoUrl: introVideoVal,
      intro_video_url: introVideoVal,
      introVideoId,
      enableNewsletter: settingBool("enableNewsletter"),
      enableSearch: settingBool("enableSearch"),
      enableSelectedWork: settingBool("enableSelectedWork"),
      enableProductOfMonth: settingBool("enableProductOfMonth"),
      tapInFilterThreshold: settingNumber("tapInFilterThreshold"),
      navigation: safeNavigation(data.navigation),
    };
  } catch (error) {
    console.error("Could not load public site settings:", error instanceof Error ? error.message : "Unknown error");
    return fallbackSettings(DEFAULT_PUBLIC_NAVIGATION);
  }
}