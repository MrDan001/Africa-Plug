// FILE PATH: src/components/seo/JsonLd.tsx
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://africa-plug.vercel.app").replace(/\/$/, "");

export default function JsonLd() {
  const payload = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "The Africa Plug",
      url: SITE_URL,
      logo: `${SITE_URL}/images/the-africa-plug-logo.jpg`,
      email: "connect@theafricaplug.com",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "The Africa Plug",
      url: SITE_URL,
      inLanguage: "en-GB",
    },
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload).replace(/</g, "\\u003c") }} />;
}