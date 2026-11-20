import { getPublicSiteSettings } from "@/lib/cms-bridge";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://theafricaplug.com").replace(/\/$/, "");

export default async function JsonLd() {
  const settings = await getPublicSiteSettings();
  const sameAs = [
    settings.linkedinUrl,
    settings.instagramUrl,
    settings.footerYoutubeUrl,
    settings.tiktokUrl,
    settings.facebookUrl,
    settings.whatsappUrl,
  ].filter((url): url is string => typeof url === "string" && /^https:\/\//i.test(url));

  const payload = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "The Africa Plug",
      url: SITE_URL,
      logo: `${SITE_URL}/images/the-africa-plug-logo.jpg`,
      email: "connect@theafricaplug.com",
      sameAs,
      address: [
        { "@type": "PostalAddress", addressLocality: "Victoria Island, Lagos", addressRegion: "Lagos", addressCountry: "NG" },
        { "@type": "PostalAddress", addressLocality: "London", addressCountry: "GB" },
      ],
      founder: { "@id": `${SITE_URL}/about#fk` },
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${SITE_URL}/about#fk`,
      name: "FK",
      jobTitle: "Founder",
      image: `${SITE_URL}/images/fk.jpg`,
      url: `${SITE_URL}/about#founder`,
      worksFor: { "@id": `${SITE_URL}/#organization` },
      sameAs,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "The Africa Plug",
      url: SITE_URL,
      inLanguage: "en-GB",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    ...[
      { name: "Deal Diagnostic with FK", description: "A 90-minute commercial deal diagnostic with FK.", price: "2500", url: "/work-with-fk/apply" },
      { name: "30-minute call with FK", description: "A focused 30-minute video consultation with FK.", price: "350", url: "/work-with-fk/call" },
      { name: "Pet Travel Consultation", description: "A 20-minute consultation to plan international travel with your pet.", price: "95", url: "/store/pet-travel-consultation" },
    ].map((service) => ({
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.name,
      description: service.description,
      provider: { "@id": `${SITE_URL}/#organization` },
      url: `${SITE_URL}${service.url}`,
      offers: {
        "@type": "Offer",
        price: service.price,
        priceCurrency: "GBP",
        url: `${SITE_URL}${service.url}`,
        availability: "https://schema.org/InStock",
      },
    })),
    ...[
      { name: "Explore Africa Like an Insider", slug: "explore-africa-like-an-insider" },
      { name: "The Unwritten Rules of Doing Business in Africa", slug: "the-unwritten-rules-of-doing-business-in-africa" },
    ].map((book) => ({
      "@context": "https://schema.org",
      "@type": "Book",
      name: book.name,
      author: { "@id": `${SITE_URL}/about#fk` },
      publisher: { "@id": `${SITE_URL}/#organization` },
      bookFormat: "https://schema.org/EBook",
      url: `${SITE_URL}/store/${book.slug}`,
      offers: {
        "@type": "Offer",
        url: `${SITE_URL}/store/${book.slug}`,
        availability: "https://schema.org/PreOrder",
      },
    })),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      ],
    },
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload).replace(/</g, "\\u003c") }} />;
}
