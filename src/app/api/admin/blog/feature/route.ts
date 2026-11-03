import { isAdminAuthenticated } from "@/lib/admin-auth";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) return Response.json({ error: "Please sign in to the admin workspace." }, { status: 401 });
  let input: { articleId?: string };
  try { input = await request.json() as typeof input; }
  catch { return Response.json({ error: "Choose an article to feature." }, { status: 400 }); }
  if (!input.articleId) return Response.json({ error: "Choose an article to feature." }, { status: 400 });
  try {
    const result = await cmsBridge<{ records?: CmsRecord[] }>({ action: "cms.list", module: "articles", status: "all" });
    const articles = result.records ?? [];
    const selected = articles.find((record) => record.id === input.articleId && record.status === "published");
    if (!selected) return Response.json({ error: "Only a published article can be featured on the homepage." }, { status: 409 });
    await Promise.all(articles.filter((record) => record.data?.featureOnHomepage === true || record.id === selected.id).map((record) =>
      cmsBridge({
        action: "cms.save",
        module: "articles",
        record: {
          id: record.id,
          title: record.title,
          slug: record.slug,
          status: record.status,
          data: { ...record.data, featureOnHomepage: record.id === selected.id },
        },
      })
    ));
    return Response.json({ ok: true, articleId: selected.id });
  } catch (error) {
    console.error("Homepage article feature could not be updated:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "Could not update the homepage featured article." }, { status: 503 });
  }
}
