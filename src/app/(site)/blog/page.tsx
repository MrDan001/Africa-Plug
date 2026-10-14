import type { Metadata } from "next";
import Link from "next/link";
import FeaturedStories from "@/components/blog/FeaturedStories";

export const metadata: Metadata = {
  title: "The TAP Journal",
  description:
    "Stories and perspectives on business, investment, culture, innovation and life across Africa.",
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
            <p>
              Thoughtful perspectives on the people, businesses, culture and
              opportunities shaping Africa. Context beyond the headline, from
              a continent that never stands still.
            </p>
            <div className="blog-page-topic-list" aria-label="Journal topics">
              <span>Business</span>
              <span>Investment</span>
              <span>Culture</span>
              <span>Innovation</span>
              <span>Travel &amp; Lifestyle</span>
            </div>
          </div>
        </div>
      </section>

      <FeaturedStories variant="page" />

      <section className="blog-page-invitation">
        <div>
          <p className="blog-page-eyebrow">KEEP THE CONVERSATION GOING</p>
          <h2>Have a perspective worth sharing?</h2>
          <p>
            We’re interested in useful insight, original ideas and stories that
            add context to the way people understand Africa.
          </p>
        </div>
        <Link href="/contact" className="blog-page-contact-link">
          Speak to the team <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </div>
  );
}
