import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts } from "@/lib/public-cms-content";
import BlogNewsletterSignup from "@/components/blog/BlogNewsletterSignup";
import { PartnershipTrigger } from "@/components/forms/PartnershipDialog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Africa Business and Investment Blog | The Africa Plug" },
  description: "Articles on the investment, business and entertainment stories shaping Africa. Beyond the headlines on markets, deals and culture across the continent.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Africa Business and Investment Blog | The Africa Plug",
    description: "Articles on the investment, business and entertainment stories shaping Africa. Beyond the headlines on markets, deals and culture across the continent.",
    url: "/blog",
    type: "website",
  },
};

type Props = { searchParams: Promise<{ category?: string }> };

const CATEGORY_ORDER = ["Investment", "Business", "Entertainment"];

function ReadTimeIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.2"/><path d="M10 5.7v4.6l3 1.8"/></svg>;
}

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const requestedCategory = (params.category || "").trim();
  const posts = await getBlogPosts();
  const publishedCategories = CATEGORY_ORDER.filter((category) => posts.some((post) => post.category.toLowerCase() === category.toLowerCase()));
  const activeCategory = publishedCategories.includes(requestedCategory) ? requestedCategory : "";
  const visiblePosts = activeCategory
    ? posts.filter((post) => post.category.toLowerCase() === activeCategory.toLowerCase())
    : posts;

  return (
    <div className="blog-index-page">
      <div className="blog-index-shell">
        <header className="blog-index-heading">
          <p className="blog-index-eyebrow">THE BLOG</p>
          <h1>Beyond the headlines.</h1>
          <p className="blog-index-intro">Articles on the investment, business and entertainment stories shaping Africa.</p>
        </header>

        <nav className="blog-index-filters" aria-label="Filter articles by territory">
          <Link href="/blog" className={!activeCategory ? "is-active" : undefined} aria-current={!activeCategory ? "page" : undefined}>All</Link>
          {publishedCategories.map((category) => (
            <Link
              href={"/blog?category=" + encodeURIComponent(category)}
              key={category}
              className={activeCategory === category ? "is-active" : undefined}
              aria-current={activeCategory === category ? "page" : undefined}
            >
              {category}
            </Link>
          ))}
        </nav>

        {visiblePosts.length ? (
          <div className="blog-index-grid">
            {visiblePosts.map((post) => (
              <Link className="blog-index-card" href={"/blog/" + encodeURIComponent(post.slug)} key={post.slug}>
                <div className="blog-index-card-image">
                  {post.image ? <img src={post.image} alt={post.imageAlt} loading="lazy" /> : <div className="blog-index-image-placeholder" aria-hidden="true">THE AFRICA PLUG</div>}
                </div>
                <div className="blog-index-card-copy">
                  <p className="blog-index-card-category">{post.category}</p>
                  <h2>{post.title}</h2>
                  <p className="blog-index-card-excerpt">{post.excerpt}</p>
                  <p className="blog-index-card-readtime"><ReadTimeIcon /> <span>{post.readingTime} read</span></p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="blog-index-empty">
            <h2>{activeCategory ? "No articles in this territory yet." : "New stories are being prepared."}</h2>
            <p>Check back for fresh perspectives from across Africa.</p>
          </div>
        )}

        <BlogNewsletterSignup />

        <section className="blog-index-pitch" aria-labelledby="blog-index-pitch-title">
          <div className="blog-index-pitch-image" role="img" aria-label="Granite hills and trees in an African landscape" />
          <div className="blog-index-pitch-copy">
            <span className="blog-index-pitch-rule" />
            <p className="blog-index-pitch-eyebrow">HAVE A STORY WORTH TELLING?</p>
            <p>We welcome original perspectives, fresh ideas and stories that bring Africa into sharper focus.</p>
            <PartnershipTrigger className="blog-index-pitch-button">PITCH AN IDEA <span aria-hidden="true">→</span></PartnershipTrigger>
            <div className="blog-index-stamp" aria-hidden="true">
              <span>AFRICA'S STORIES</span>
              <b>AFRICA</b>
              <span>GREATER POSSIBILITIES</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}