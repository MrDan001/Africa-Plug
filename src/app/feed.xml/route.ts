import { getBlogPosts } from "@/lib/public-cms-content";

export const dynamic = "force-dynamic";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://africa-plug.vercel.app").replace(/\/$/, "");

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function pubDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toUTCString() : date.toUTCString();
}

export async function GET() {
  const posts = await getBlogPosts();
  const items = posts.map((post) => `<item>
    <title>${escapeXml(post.title)}</title>
    <link>${SITE_URL}/blog/${encodeURIComponent(post.slug)}</link>
    <guid isPermaLink="true">${SITE_URL}/blog/${encodeURIComponent(post.slug)}</guid>
    <description>${escapeXml(post.excerpt)}</description>
    <pubDate>${pubDate(post.publishedAt)}</pubDate>
    <author>editorial@theafricaplug.com (${escapeXml(post.author)})</author>
    ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("\n    ")}
  </item>`).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>The TAP Journal — The Africa Plug</title>
    <link>${SITE_URL}/blog</link>
    <description>Practical written perspectives from The Africa Plug.</description>
    <language>en-gb</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=300" } });
}
