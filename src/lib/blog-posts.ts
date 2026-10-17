// FILE PATH: src/lib/blog-posts.ts
export type BlogChecklistItem = { label: string; detail: string };
export type BlogSection = { heading: string; paragraphs: string[]; checklist?: BlogChecklistItem[] };
export type BlogPost = {
  slug: string; category: string; title: string; excerpt: string; image: string; imageAlt: string;
  publishedAt: string; readingTime: string; author: string; tags: string[]; takeaway: string; sections: BlogSection[];
  seoTitle?: string; seoDescription?: string; shareImage?: string;
};