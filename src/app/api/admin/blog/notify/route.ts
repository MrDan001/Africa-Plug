import { createHmac } from "node:crypto";
import { sendClientEmail } from "@/lib/emails/send";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function origin() {
  try { return new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://theafricaplug.com").origin; }
  catch { return "https://theafricaplug.com"; }
}
function unsubscribeUrl(record: CmsRecord, email: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Blog unsubscribe signing is not configured.");
  const token = createHmac("sha256", secret).update(record.id + ":" + email.toLowerCase() + ":blog-unsubscribe").digest("hex");
  const url = new URL("/api/blog/subscribe/unsubscribe", origin());
  url.searchParams.set("id", record.id);
  url.searchParams.set("token", token);
  return url.toString();
}
export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) return Response.json({ error: "Please sign in to the admin workspace." }, { status: 401 });
  let input: { articleId?: string };
  try { input = await request.json() as typeof input; }
  catch { return Response.json({ error: "Choose a published article first." }, { status: 400 }); }
  if (!input.articleId) return Response.json({ error: "Choose a published article first." }, { status: 400 });
  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_SESSION_SECRET) {
    return Response.json({ error: "Blog email delivery is not fully configured. Check RESEND_API_KEY, EMAIL_FROM and ADMIN_SESSION_SECRET." }, { status: 503 });
  }
  try {
    const [articlesResult, subscribersResult] = await Promise.all([
      cmsBridge<{ records?: CmsRecord[] }>({ action: "cms.list", module: "articles", status: "all", id: input.articleId }),
      cmsBridge<{ records?: CmsRecord[] }>({ action: "cms.list", module: "subscribers", status: "all" }),
    ]);
    const article = (articlesResult.records ?? []).find((record) => record.id === input.articleId && record.status === "published");
    if (!article) return Response.json({ error: "Only a published article can be emailed to Blog readers." }, { status: 409 });
    const articleDate = Date.parse(String(article.data?.publishedAt ?? ""));
    if (Number.isFinite(articleDate) && articleDate > Date.now()) return Response.json({ error: "This article is scheduled for a future date. It cannot be emailed yet." }, { status: 409 });
    const byEmail = new Map<string, CmsRecord>();
    for (const record of subscribersResult.records ?? []) {
      const data = record.data ?? {};
      const email = String(data.email ?? "").trim().toLowerCase();
      if (data.list !== "blog" || record.status !== "active" || data.consent !== true || data.subscriptionStatus === "unsubscribed") continue;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || data.lastArticleSlug === article.slug) continue;
      if (!byEmail.has(email)) byEmail.set(email, record);
    }
    const recipients = Array.from(byEmail.entries());
    if (!recipients.length) return Response.json({ ok: true, sent: 0, message: "There are no new confirmed Blog readers to notify for this article." });
    if (recipients.length > 1000) return Response.json({ error: "This Blog list has more than 1,000 addresses. Contact support before sending a larger campaign." }, { status: 413 });
    const articleUrl = new URL("/blog/" + encodeURIComponent(article.slug || ""), origin()).toString();
    const articleTitle = article.title;
    const summary = String(article.data?.excerpt ?? "").slice(0, 1000);
    let sent = 0;
    for (let offset = 0; offset < recipients.length; offset += 100) {
      const chunk = recipients.slice(offset, offset + 100);
      for (const [email, record] of chunk) {
        const optout = unsubscribeUrl(record, email);
        const result = await sendClientEmail("blogNewArticle", email, {
          articleTitle,
          shortSummary: summary,
          articleLink: articleUrl,
          unsubscribeLink: optout,
        }, { idempotencyKey: "tap-blog-article-" + article.id + "-" + record.id, headers: { "List-Unsubscribe": `<${optout}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } });
        if (result.status !== "sent") {
          return Response.json({ error: "Email provider rejected the campaign after " + sent + " messages: " + (result.error || result.status), sent }, { status: 502 });
        }
      }
      sent += chunk.length;
      const deliveredAt = new Date().toISOString();
      await Promise.all(chunk.map(([, record]) => cmsBridge({
        action: "cms.save",
        module: "subscribers",
        record: {
          id: record.id, title: record.title, slug: record.slug, status: record.status,
          data: { ...record.data, lastArticleSlug: article.slug, lastArticleNotifiedAt: deliveredAt },
        },
      })));
    }
    return Response.json({ ok: true, sent, message: "Article announcement sent to " + sent + " confirmed Blog reader(s)." });
  } catch (error) {
    console.error("Blog reader campaign failed:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "Could not send the Blog reader email campaign." }, { status: 503 });
  }
}
