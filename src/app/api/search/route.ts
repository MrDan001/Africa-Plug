import { getPublicCmsRecords } from "@/lib/cms-bridge";
import { getBlogPosts, cmsRecordToPublicProduct } from "@/lib/public-cms-content";
import { listLiveOpportunities } from "@/lib/tap-in/opportunities";

export const dynamic = "force-dynamic";

type SearchItem = { title: string; description: string; href: string; keywords: string };

const PAGES: SearchItem[] = [
  { title: "TAP IN", description: "Explore current business and investment opportunities.", href: "/tap-in", keywords: "opportunities listings business investment" },
  { title: "Work With FK", description: "Commercial consultancy and market navigation.", href: "/work-with-fk", keywords: "commercial consulting market entry application" },
  { title: "The Store", description: "Practical TAP resources and digital products.", href: "/store", keywords: "store resources guides products" },
  { title: "The TAP Journal", description: "Read approved written editorial from The Africa Plug.", href: "/blog", keywords: "blog journal articles editorial" },
  { title: "Ask The Africa Plug", description: "Ask a question about Africa, a market, place or opportunity.", href: "/contact?type=ask", keywords: "question ask help market place" },
  { title: "Partner With TAP", description: "Explore sponsorship and partnership opportunities.", href: "/contact?type=partner", keywords: "partnership sponsorship collaboration" },
  { title: "Contact", description: "Contact The Africa Plug team.", href: "/contact", keywords: "email contact connect" },
  { title: "About The Africa Plug", description: "Learn about the platform and what it does.", href: "/about", keywords: "about company mission" },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim().toLowerCase().slice(0, 100);
  if (!query) return Response.json({ results: [] }, { headers: { "Cache-Control": "no-store" } });

  const [posts, productRecords, opportunities] = await Promise.all([
    getBlogPosts(),
    getPublicCmsRecords("products"),
    listLiveOpportunities().catch(() => []),
  ]);
  const products = productRecords.map(cmsRecordToPublicProduct).filter((item): item is NonNullable<ReturnType<typeof cmsRecordToPublicProduct>> => item !== null);
  const content: SearchItem[] = [
    ...PAGES,
    ...posts.map((post) => ({ title: post.title, description: post.excerpt, href: `/blog/${encodeURIComponent(post.slug)}`, keywords: [post.category, ...post.tags].join(" ") })),
    ...products.map((product) => ({ title: product.title, description: product.summary, href: `/store/${encodeURIComponent(product.slug)}`, keywords: product.productType })),
    ...opportunities.map((opportunity) => ({ title: opportunity.title, description: opportunity.who_this_is_for, href: `/tap-in/${encodeURIComponent(opportunity.slug)}`, keywords: [opportunity.country, opportunity.region, opportunity.sector, opportunity.opportunity_type].join(" ") })),
  ];

  const results = content.map((item) => {
    const title = item.title.toLowerCase();
    const desc = item.description.toLowerCase();
    const keys = item.keywords.toLowerCase();
    const score = title === query ? 5 : title.startsWith(query) ? 4 : title.includes(query) ? 3 : keys.includes(query) ? 2 : desc.includes(query) ? 1 : 0;
    return { item, score };
  }).filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, 8)
    .map((entry) => entry.item);

  return Response.json({ results }, { headers: { "Cache-Control": "no-store" } });
}
