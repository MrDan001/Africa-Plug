import type { Metadata } from "next";
import Link from "next/link";
import FeaturedStories from "@/components/blog/FeaturedStories";
import { BLOG_POSTS } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "The TAP Journal",
  description: "Original practical perspectives on business, trade, investment, culture, technology and opportunities across Africa.",
};

export default function BlogPage() {
  return (
    <div className="blog-page">
      <section className="blog-page-hero">
        <div className="blog-page-hero-inner">
          <div className="blog-page-hero-copy">
            <p className="blog-page-eyebrow">THE TAP JOURNAL</p>
            <h1>Stories that help you see the bigger picture.</h1>
          </div>
          <div className="blog-page-hero-summary">
            <p>Thoughtful, practical perspectives on the people, businesses, systems and ideas shaping Africa. Context beyond the headline, with questions you can put to work.</p>
            <div className="blog-page-topic-list" aria-label="Journal topics">
              <span>Business</span><span>Trade</span><span>Investment</span><span>Technology</span><span>Culture</span><span>Infrastructure</span>
            </div>
            <p className="blog-page-library-note"><strong>{BLOG_POSTS.length} original articles.</strong> Each story includes a practical takeaway and links to public research for further reading.</p>
          </div>
        </div>
      </section>
      <FeaturedStories variant="page" />
      <section className="blog-page-invitation">
        <div>
          <p className="blog-page-eyebrow">KEEP THE CONVERSATION GOING</p>
          <h2>Have a perspective worth sharing?</h2>
          <p>We’re interested in useful insight, original ideas and stories that add context to the way people understand Africa.</p>
        </div>
        <Link href="/contact" className="blog-page-contact-link">Speak to the team <span aria-hidden="true">↗</span></Link>
      </section>
    </div>
  );
}
