import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPosts, getPublicBlogPost } from "@/lib/public-cms-content";
import { parseYouTubeId } from "@/lib/youtube";
import BlogNewsletterSignup from "@/components/blog/BlogNewsletterSignup";
import BlogShareBar from "@/components/blog/BlogShareBar";

type BlogArticlePageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";
export async function generateStaticParams() { return []; }

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicBlogPost(slug);
  if (!post) return { title: "Article not found" };
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://theafricaplug.com").replace(/\/$/, "");
  const canonical = baseUrl + "/blog/" + encodeURIComponent(post.slug);
  const shareImage = post.shareImage || post.image;
  return {
    title: { absolute: post.seoTitle || (post.title + " | The Africa Plug") },
    description: post.seoDescription || post.excerpt,
    authors: [{ name: post.author }],
    keywords: post.tags,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      publishedTime: new Date(post.publishedAt).toISOString(),
      authors: [post.author],
      images: shareImage ? [{ url: shareImage, alt: post.imageAlt }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: shareImage ? [shareImage] : [],
    },
  };
}

function renderInlineLinks(value: string) {
  const parts = value.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/(?!\/)[^\s)]*)\)$/);
    return match
      ? <a key={index} href={match[2]} target={match[2].startsWith("http") ? "_blank" : undefined} rel={match[2].startsWith("http") ? "noreferrer" : undefined}>{match[1]}</a>
      : <span key={index}>{part}</span>;
  });
}

function ArticleSection({ section, index }: { section: { heading: string; paragraphs: string[]; checklist?: { label: string; detail: string }[]; image?: string; imageAlt?: string; caption?: string; pullQuote?: string; youtubeUrl?: string }; index: number }) {
  const videoId = section.youtubeUrl ? parseYouTubeId(section.youtubeUrl) : null;
  return (
    <section className="blog-article-content-section" key={section.heading || "section-" + index}>
      {section.heading ? <h2>{section.heading}</h2> : null}
      {section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{renderInlineLinks(paragraph)}</p>)}
      {section.image ? <figure className="blog-article-inline-figure"><img src={section.image} alt={section.imageAlt || ""} loading="lazy" />{section.caption ? <figcaption>{section.caption}</figcaption> : null}</figure> : null}
      {section.pullQuote ? <blockquote className="blog-article-pullquote">{section.pullQuote}</blockquote> : null}
      {section.youtubeUrl && videoId ? <div className="blog-article-video"><iframe src={"https://www.youtube-nocookie.com/embed/" + videoId} title="Embedded video" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div> : null}
      {section.checklist?.length ? <ul className="blog-article-checklist">{section.checklist.map((item) => <li key={item.label}><strong>{item.label}.</strong> {item.detail}</li>)}</ul> : null}
    </section>
  );
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getPublicBlogPost(slug), getBlogPosts()]);
  if (!post) notFound();
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://theafricaplug.com").replace(/\/$/, "");
  const canonical = baseUrl + "/blog/" + encodeURIComponent(post.slug);
  const related = allPosts.filter((item) => item.slug !== post.slug && item.category.toLowerCase() === post.category.toLowerCase()).slice(0, 3);
  const publishedDate = new Date(post.publishedAt).toISOString();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.shareImage || post.image || undefined,
    datePublished: publishedDate,
    dateModified: publishedDate,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: "The Africa Plug", url: baseUrl },
    mainEntityOfPage: canonical,
    articleSection: post.category,
    keywords: post.tags.join(", "),
  };

  return (
    <article className="blog-article-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <div className="blog-article-shell">
        <Link href="/blog" className="blog-article-back"><span aria-hidden="true">←</span> THE BLOG</Link>
        <header className="blog-article-heading">
          <Link className="blog-page-eyebrow blog-article-category-link" href={"/blog?category=" + encodeURIComponent(post.category)}>{post.category}</Link>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <div className="blog-article-byline">
            <span>{post.author}</span><span>{post.publishedAt}</span><span>{post.readingTime} read</span>
          </div>
        </header>
        {post.image ? <figure className="blog-article-cover"><img src={post.image} alt={post.imageAlt} />{post.imageCredit ? <figcaption>Image: {post.imageCredit}</figcaption> : null}</figure> : null}
        <BlogShareBar title={post.title} url={canonical} />
        <div className="blog-article-content">
          {post.sections.map((section, index) => <ArticleSection section={section} index={index} key={section.heading || "section-" + index} />)}
          {post.takeaway ? <aside className="blog-article-takeaway"><p className="blog-page-eyebrow">THE TAKEAWAY</p><p>{post.takeaway}</p></aside> : null}
        </div>
        <div className="blog-article-subscription">
          <p className="blog-page-eyebrow">THE BLOG</p>
          <h2>Get the next story in your inbox.</h2>
          <p>Useful context and original perspectives, when a new article goes live.</p>
          <BlogNewsletterSignup />
        </div>
        {related.length ? <section className="blog-related" aria-labelledby="blog-related-title">
          <div className="blog-related-heading"><p className="blog-page-eyebrow">{post.category.toUpperCase()}</p><h2 id="blog-related-title">More from this territory.</h2></div>
          <div className="blog-related-grid">
            {related.map((item) => <Link className="blog-related-card" href={"/blog/" + encodeURIComponent(item.slug)} key={item.slug}>
              {item.image ? <img src={item.image} alt={item.imageAlt} loading="lazy" /> : null}
              <span>{item.category}</span><strong>{item.title}</strong><small>{item.readingTime} read</small>
            </Link>)}
          </div>
        </section> : null}
      </div>
    </article>
  );
}
