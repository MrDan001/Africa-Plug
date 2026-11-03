import Link from "next/link";
import { getBlogPosts } from "@/lib/public-cms-content";

export default async function FeaturedStories({ variant: _variant = "home" }: { variant?: "home" | "page" }) {
  const posts = await getBlogPosts();
  const post = posts.find((item) => item.featureOnHomepage) ?? posts[0];
  if (!post) return null;

  return (
    <section id="blog" className={`featured-blog-section${_variant === "home" ? " featured-blog-section-home" : ""}`} aria-labelledby={`${_variant}-featured-stories-title`}>
      <div className="featured-blog-inner">
        <header className="featured-blog-header">
          <div>
            <p className="featured-blog-eyebrow">THE BLOG</p>
            <h2 id={`${_variant}-featured-stories-title`}>Beyond the headlines.</h2>
          </div>
          <Link className="featured-blog-view-all" href="/blog">View all <span aria-hidden="true">→</span></Link>
        </header>
        <Link className="featured-blog-card featured-blog-card--primary" href={"/blog/" + encodeURIComponent(post.slug)} aria-label={"Read article: " + post.title}>
            <span className="featured-blog-card-image" role="img" aria-label={post.imageAlt} style={{ backgroundImage: post.image ? 'url("' + post.image + '")' : undefined }} />
            <span className="featured-blog-card-copy">
              <span className="featured-blog-card-category">{post.category}</span>
              <span className="featured-blog-card-title">{post.title}</span>
              <span className="featured-blog-card-excerpt">{post.excerpt}</span>
              <span className="featured-blog-card-arrow" aria-hidden="true">↗</span>
            </span>
        </Link>
      </div>
    </section>
  );
}
