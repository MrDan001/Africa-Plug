import { createHash, createHmac } from "node:crypto";
import { Resend } from "resend";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
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
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from || !process.env.ADMIN_SESSION_SECRET) {
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
    const resend = new Resend(apiKey);
    let sent = 0;
    for (let offset = 0; offset < recipients.length; offset += 100) {
      const chunk = recipients.slice(offset, offset + 100);
      const messages = chunk.map(([email, record]) => {
        const optout = unsubscribeUrl(record, email);
        return {
          from,
          to: [email],
          replyTo: process.env.EMAIL_CONNECT || "connect@theafricaplug.com",
          subject: "New on The Blog: " + articleTitle,
          text: "A new article is live on The Blog.\n\n" + articleTitle + "\n\n" + summary + "\n\nRead the article: " + articleUrl + "\n\nUnsubscribe from The Blog: " + optout + "\n\nThe Africa Plug",
          html: "<div style='background:#f8f5ef;padding:28px 16px;font-family:Arial,sans-serif;color:#25221e'><div style='max-width:560px;margin:0 auto;background:#fffdfa;border:1px solid #ded8cf;padding:30px'><p style='font-size:10px;font-weight:800;letter-spacing:3px;color:#b65e73'>THE BLOG · THE AFRICA PLUG</p><h1 style='font:700 30px/1.1 Georgia,serif'>" + escapeHtml(articleTitle) + "</h1><p style='font-size:14px;line-height:1.7'>" + escapeHtml(summary) + "</p><p style='margin:26px 0'><a href='" + articleUrl + "' style='display:inline-block;background:#cb5274;color:white;text-decoration:none;padding:14px 22px;font-size:11px;font-weight:800;letter-spacing:1px'>READ THE ARTICLE →</a></p><p style='font-size:12px;color:#777169;line-height:1.6'>You receive these messages because you confirmed a subscription to The Blog. <a href='" + optout + "' style='color:#a64b64'>Unsubscribe at any time</a>.</p></div></div>",
          headers: { "List-Unsubscribe": "<" + optout + ">", "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
        };
      });
      const ids = chunk.map(([, record]) => record.id).sort().join("|");
      const idempotencyKey = "tap-blog-article-" + article.id + "-" + createHash("sha256").update(ids).digest("hex").slice(0, 32);
      const result = await resend.batch.send(messages, { idempotencyKey });
      if (result.error) return Response.json({ error: "Email provider rejected the campaign after " + sent + " messages: " + result.error.message, sent }, { status: 502 });
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
