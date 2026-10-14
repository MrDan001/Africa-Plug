import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog-posts";

type FeaturedStoriesProps = { variant?: "home" | "page" };

export default function FeaturedStories({ variant = "home" }: FeaturedStoriesProps) {
  const isHome = variant === "home";
  const visiblePosts = isHome ? BLOG_POSTS.slice(0, 4) : BLOG_POSTS;

  return (
    <section
      id={isHome ? "blog" : "featured-stories"}
      className={`featured-blog-section ${isHome ? "featured-blog-section-home" : "featured-blog-section-page"}`}
      aria-labelledby={isHome ? "home-featured-stories-title" : "journal-featured-stories-title"}
    >
      <div className="featured-blog-inner">
        <header className="featured-blog-header">
          <div>
            <p className="featured-blog-eyebrow">{isHome ? "FEATURED" : "THE FULL JOURNAL"}</p>
            <h2 id={isHome ? "home-featured-stories-title" : "journal-featured-stories-title"}>
              {isHome ? "What’s happening in Africa" : "Practical ideas for a changing continent"}
            </h2>
            {!isHome ? <p className="featured-blog-intro">Ten original explainers on trade, partnerships, finance, technology, infrastructure, food systems and culture.</p> : null}
          </div>
          {isHome ? (
            <Link className="featured-blog-view-all" href="/blog">View all <span aria-hidden="true">→</span></Link>
          ) : (
)}
        </header>

        {isHome ? (
          <div className="featured-blog-grid">
            {visiblePosts.map((post, index) => {
              const layout = index === 0 ? "primary" : index === 3 ? "text" : "secondary";
              return (
                <Link className={`featured-blog-card featured-blog-card--${layout}`} href={`/blog/${post.slug}`} key={post.slug} aria-label={`Read article: ${post.title}`}>
                  {layout !== "text" ? (
                    <span className="featured-blog-card-image" role="img" aria-label={post.imageAlt} style={{ backgroundImage: `url("${post.image}")` }} />
                  ) : null}
                  <span className="featured-blog-card-copy">
                    <span className="featured-blog-card-category">{post.category}</span>
                    <span className="featured-blog-card-title">{post.title}</span>
                    {layout === "primary" ? <span className="featured-blog-card-excerpt">{post.excerpt}</span> : null}
                    <span className="featured-blog-card-arrow" aria-hidden="true">↗</span>
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="featured-blog-grid featured-blog-grid--journal">
            {visiblePosts.map((post) => (
              <Link className="featured-blog-card featured-blog-card--journal" href={`/blog/${post.slug}`} key={post.slug} aria-label={`Read article: ${post.title}`}>
                <span className="featured-blog-card-image" role="img" aria-label={post.imageAlt} style={{ backgroundImage: `url("${post.image}")` }} />
                <span className="featured-blog-card-copy">
                  <span className="featured-blog-card-category">{post.category}</span>
                  <span className="featured-blog-card-title">{post.title}</span>
                  <span className="featured-blog-card-excerpt">{post.excerpt}</span>
                  <span className="featured-blog-card-meta">{post.readingTime} <span aria-hidden="true">·</span> {post.publishedAt}</span>
                  <span className="featured-blog-card-arrow" aria-hidden="true">↗</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
