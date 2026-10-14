import Link from "next/link";
import { FEATURED_BLOG_POSTS } from "@/lib/blog-posts";

type FeaturedStoriesProps = {
  variant?: "home" | "page";
};

export default function FeaturedStories({
  variant = "home",
}: FeaturedStoriesProps) {
  const isHome = variant === "home";

  return (
    <section
      id={isHome ? "blog" : "featured-stories"}
      className={`featured-blog-section ${isHome ? "featured-blog-section-home" : "featured-blog-section-page"}`}
      aria-labelledby={isHome ? "home-featured-stories-title" : "journal-featured-stories-title"}
    >
      <div className="featured-blog-inner">
        <header className="featured-blog-header">
          <div>
            <p className="featured-blog-eyebrow">FEATURED</p>
            <h2 id={isHome ? "home-featured-stories-title" : "journal-featured-stories-title"}>
              What’s happening in Africa
            </h2>
          </div>
          {isHome ? (
            <Link className="featured-blog-view-all" href="/blog">
              View all <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </header>

        <div className="featured-blog-grid">
          {FEATURED_BLOG_POSTS.map((post, index) => {
            const layout =
              index === 0 ? "primary" : index === 3 ? "text" : "secondary";

            return (
              <Link
                className={`featured-blog-card featured-blog-card--${layout}`}
                href={`/blog/${post.slug}`}
                key={post.slug}
                aria-label={`Open preview: ${post.title}`}
              >
                {layout !== "text" ? (
                  <span
                    className="featured-blog-card-image"
                    role="img"
                    aria-label={post.imageAlt}
                    style={{ backgroundImage: `url("${post.image}")` }}
                  />
                ) : null}
                <span className="featured-blog-card-copy">
                  <span className="featured-blog-card-category">{post.category}</span>
                  <span className="featured-blog-card-title">{post.title}</span>
                  {layout === "primary" ? (
                    <span className="featured-blog-card-excerpt">{post.excerpt}</span>
                  ) : null}
                  <span className="featured-blog-card-arrow" aria-hidden="true">↗</span>
                </span>
              </Link>
            );
          })}
        </div>

        {isHome ? (
          <div className="featured-blog-social">
            <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
              <b>in</b> Follow on LinkedIn
            </a>
            <a href="https://www.youtube.com/" target="_blank" rel="noreferrer">
              <b>▶</b> Watch on YouTube
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
              <b>◎</b> Follow on Instagram
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
