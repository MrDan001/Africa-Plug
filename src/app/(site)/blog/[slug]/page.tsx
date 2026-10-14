import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/lib/blog-posts";

type BlogArticlePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((item) => item.slug === slug);
  if (!post) return { title: "Article not found" };

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author }],
    keywords: post.tags,
    openGraph: { type: "article", title: post.title, description: post.excerpt, images: [post.image] },
  };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((item) => item.slug === slug);
  if (!post) notFound();

  return (
    <article className="blog-article-page">
      <div className="blog-article-shell">
        <Link href="/blog" className="blog-article-back"><span aria-hidden="true">←</span> THE TAP JOURNAL</Link>
        <header className="blog-article-heading">
          <p className="blog-page-eyebrow">{post.category}</p>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <div className="blog-article-byline">
            <span>{post.author}</span><span>{post.publishedAt}</span><span>{post.readingTime}</span>
          </div>
          <div className="blog-article-tags" aria-label="Article topics">
            {post.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </header>
        <div className="blog-article-cover" role="img" aria-label={post.imageAlt} style={{ backgroundImage: `url("${post.image}")` }} />
        <div className="blog-article-content">
          {post.sections.map((section) => (
            <section className="blog-article-content-section" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              {section.checklist ? (
                <ul className="blog-article-checklist">
                  {section.checklist.map((item) => <li key={item.label}><strong>{item.label}.</strong> {item.detail}</li>)}
                </ul>
              ) : null}
            </section>
          ))}
          <aside className="blog-article-takeaway">
            <p className="blog-page-eyebrow">THE TAP TAKEAWAY</p>
            <p>{post.takeaway}</p>
          </aside>
<div className="blog-article-end">
            <span>END OF ARTICLE</span>
            <Link href="/blog">Explore more from The TAP Journal <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </div>
    </article>
  );
}
