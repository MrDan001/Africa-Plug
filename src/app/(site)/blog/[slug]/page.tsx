import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FEATURED_BLOG_POSTS } from "@/lib/blog-posts";

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return FEATURED_BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = FEATURED_BLOG_POSTS.find((item) => item.slug === slug);

  if (!post) return { title: "Article not found" };

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogArticlePage({
  params,
}: BlogArticlePageProps) {
  const { slug } = await params;
  const post = FEATURED_BLOG_POSTS.find((item) => item.slug === slug);

  if (!post) notFound();

  return (
    <article className="blog-article-page">
      <div className="blog-article-shell">
        <Link href="/blog" className="blog-article-back">
          <span aria-hidden="true">←</span> THE TAP JOURNAL
        </Link>

        <header className="blog-article-heading">
          <p className="blog-page-eyebrow">{post.category}</p>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
        </header>

        <div
          className="blog-article-cover"
          role="img"
          aria-label={post.imageAlt}
          style={{ backgroundImage: `url("${post.image}")` }}
        />

        <section className="blog-article-preview">
          <p className="blog-page-eyebrow">ARTICLE PREVIEW</p>
          <h2>This story is being prepared for publication.</h2>
          <p>
            This featured card previews the direction of The Africa Plug’s
            journal. The full article will appear here when the final story has
            been written and approved.
          </p>
          <Link href="/blog" className="blog-page-contact-link">
            Explore the Journal <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </div>
    </article>
  );
}
