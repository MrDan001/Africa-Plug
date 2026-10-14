/**
 * Starter editorial cards for the TAP Journal layout.
 *
 * These are preview entries, not published reporting. Replace or connect this
 * data to the CMS when the approved articles and publishing workflow are ready.
 */
export type BlogPostPreview = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  previewOnly: true;
};

export const FEATURED_BLOG_POSTS: BlogPostPreview[] = [
  {
    slug: "africas-next-wave",
    category: "Business",
    title: "Why Africa’s Next Wave Isn’t Just About Resources",
    excerpt:
      "Look beyond raw materials to the people, ideas and businesses shaping how opportunity can grow across the continent.",
    image:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "City skyline at dusk",
    previewOnly: true,
  },
  {
    slug: "power-of-local-partnerships",
    category: "Investment",
    title: "The Power of Local Partnerships",
    excerpt:
      "Local knowledge, shared expectations and trust can make the difference between an introduction and a lasting relationship.",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Expansive green agricultural landscape",
    previewOnly: true,
  },
  {
    slug: "building-a-connected-africa",
    category: "Innovation",
    title: "Building a More Connected Africa",
    excerpt:
      "A look at the relationships and practical ideas that help people, knowledge and opportunities travel further.",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "People collaborating around a table",
    previewOnly: true,
  },
  {
    slug: "people-behind-the-progress",
    category: "Culture",
    title: "The People Behind Africa’s Progress",
    excerpt:
      "Meet the perspectives, creative energy and everyday work that deserve a place in the wider conversation about Africa.",
    image:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "A group of people spending time together",
    previewOnly: true,
  },
];
