import type { MetadataRoute } from "next";
import { getBlogPosts, cmsRecordToPublicProduct } from "@/lib/public-cms-content";
import { getPublicCmsRecords } from "@/lib/cms-bridge";
import { listLiveOpportunities } from "@/lib/tap-in/opportunities";

export const dynamic = "force-dynamic";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://africa-plug.vercel.app").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, productRecords, opportunities] = await Promise.all([
    getBlogPosts(),
    getPublicCmsRecords("products"),
    listLiveOpportunities().catch(() => []),
  ]);
  const products = productRecords.map(cmsRecordToPublicProduct).filter((item): item is NonNullable<ReturnType<typeof cmsRecordToPublicProduct>> => item !== null);
  const pages: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/tap-in", priority: 0.8, changeFrequency: "daily" },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
    { path: "/feed.xml", priority: 0.5, changeFrequency: "daily" },
    { path: "/store", priority: 0.8, changeFrequency: "monthly" },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
    { path: "/work-with-fk", priority: 0.8, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
    { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
    { path: "/refunds", priority: 0.3, changeFrequency: "yearly" },
  ];

  const lastModified = new Date();
  return [
    ...pages.map(({ path, priority, changeFrequency }) => ({ url: `${SITE_URL}${path || "/"}`, lastModified, changeFrequency, priority })),
    ...posts.map((post) => ({ url: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`, lastModified, changeFrequency: "monthly" as const, priority: 0.65 })),
    ...products.map((product) => ({ url: `${SITE_URL}/store/${encodeURIComponent(product.slug)}`, lastModified, changeFrequency: "monthly" as const, priority: 0.65 })),
    ...opportunities.map((opportunity) => ({ url: `${SITE_URL}/tap-in/${encodeURIComponent(opportunity.slug)}`, lastModified, changeFrequency: "daily" as const, priority: 0.7 })),
  ];
}
