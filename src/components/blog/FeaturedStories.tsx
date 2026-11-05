import Link from "next/link";
import { getBlogPosts } from "@/lib/public-cms-content";

export default async function FeaturedStories({ variant: _variant = "home" }: { variant?: "home" | "page" }) {
  const posts = await getBlogPosts();
  const post = posts.find((item) => item.featureOnHomepage) ?? posts[0];
  const previewPost = !post && _variant === "home" && process.env.NODE_ENV === "development"
    ? { slug: "", category: "Business", title: "A new trade corridor is reshaping opportunities across Africa", excerpt: "From infrastructure to industrial growth, new regional connections are opening up markets, lowering costs and creating fresh opportunities across the continent." }
    : null;
  const story = post ?? previewPost;
  if (!story) return null;
  const cardContent = <>
    <span className="featured-blog-card-category">{story.category}</span>
    <span className="featured-blog-card-title">{story.title}</span>
    <span className="featured-blog-card-excerpt">{story.excerpt}</span>
    {post ? <span className="featured-blog-card-arrow" aria-hidden="true">READ MORE <b>→</b></span> : <span className="featured-blog-card-arrow" aria-hidden="true">PREVIEW</span>}
  </>;

  return (
    <section id="blog" className={`featured-blog-section${_variant === "home" ? " featured-blog-section-home" : ""}`} aria-labelledby={`${_variant}-featured-stories-title`}>
      <div className="featured-blog-inner">
        <header className="featured-blog-header">
          <div>
            <p className="featured-blog-eyebrow">{_variant === "home" ? "FEATURED" : "THE BLOG"}</p>
            <h2 id={`${_variant}-featured-stories-title`}>{_variant === "home" ? "What’s happening in Africa" : "Beyond the headlines."}</h2>
            {_variant === "home" ? <p className="featured-blog-intro">Beyond the headlines.</p> : null}
          </div>
          <Link className="featured-blog-view-all" href="/blog">{_variant === "home" ? "VIEW ALL" : "View all"} <span aria-hidden="true">→</span></Link>
        </header>
        {post ? <Link className="featured-blog-card featured-blog-card--primary" href={`/blog/${encodeURIComponent(post.slug)}`} aria-label={`Read article: ${post.title}`}><span className="featured-blog-card-copy">{cardContent}</span></Link>
          : <div className="featured-blog-card featured-blog-card--primary featured-blog-card-preview" aria-label="Development preview of the featured story"><span className="featured-blog-card-copy">{cardContent}</span></div>}
      </div>
    </section>
  );
}
